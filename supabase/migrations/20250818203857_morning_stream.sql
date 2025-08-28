/*
  # Create Telnyx Integration Tables

  1. New Tables
    - `clients`
      - Stores client information with Stripe and Telnyx IDs
      - Links customers to their provisioned services
    - `call_usage`
      - Tracks call usage data from Telnyx webhooks
      - Used for billing and reporting
    - `subscriptions`
      - Stores Stripe subscription information
      - Tracks billing status and periods

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access
    - Secure client and usage data

  3. Indexes
    - Performance indexes for usage queries
    - Client lookup optimization
*/

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  email text NOT NULL,
  phone text,
  stripe_customer_id text UNIQUE NOT NULL,
  stripe_subscription_id text UNIQUE,
  telnyx_account_id text UNIQUE,
  phone_number text,
  phone_number_id text,
  ai_agent_id text,
  plan_id text NOT NULL,
  plan_name text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'canceled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create call usage table
CREATE TABLE IF NOT EXISTS call_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  call_id text NOT NULL,
  phone_number text NOT NULL,
  duration_seconds integer DEFAULT 0,
  cost_cents integer DEFAULT 0,
  call_type text CHECK (call_type IN ('inbound', 'outbound')),
  timestamp timestamptz DEFAULT now(),
  billing_period text NOT NULL, -- YYYY-MM format
  created_at timestamptz DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  stripe_subscription_id text UNIQUE NOT NULL,
  stripe_customer_id text NOT NULL,
  status text NOT NULL,
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  plan_id text NOT NULL,
  amount integer, -- in cents
  currency text DEFAULT 'usd',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clients
CREATE POLICY "Authenticated users can manage clients"
  ON clients
  FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for call_usage
CREATE POLICY "Authenticated users can manage call usage"
  ON call_usage
  FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for subscriptions
CREATE POLICY "Authenticated users can manage subscriptions"
  ON subscriptions
  FOR ALL
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_clients_stripe_customer ON clients(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_clients_telnyx_account ON clients(telnyx_account_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);

CREATE INDEX IF NOT EXISTS idx_call_usage_client ON call_usage(client_id);
CREATE INDEX IF NOT EXISTS idx_call_usage_billing_period ON call_usage(billing_period);
CREATE INDEX IF NOT EXISTS idx_call_usage_timestamp ON call_usage(timestamp);

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_client ON subscriptions(client_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON clients 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at 
    BEFORE UPDATE ON subscriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();