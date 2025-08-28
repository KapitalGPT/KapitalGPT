/*
  # Add Stripe Email and Subscription Events Tracking

  1. Changes
    - Add `stripe_email` column to `clients` table for Stripe Customer Portal integration
    - Create `subscription_events` table to capture all Stripe webhook data
    - Add `is_paid` field to auth.users metadata (handled via user_metadata)

  2. New Tables
    - `subscription_events`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `subscription_id` (text, from Stripe)
      - `customer_id` (text, from Stripe)
      - `payment_status` (text, from Stripe)
      - `checkout_session_id` (text, from Stripe)
      - `stripe_email` (text, from Stripe customer details)
      - `amount` (integer, in cents from Stripe)
      - `currency` (text, from Stripe)
      - `interval` (text, billing interval from Stripe)
      - `invoice_id` (text, from Stripe)
      - `subscription_status` (text, active/canceled/etc)
      - `cancel_at_period_end` (boolean, from Stripe)
      - `canceled_at` (timestamptz, from Stripe)
      - `current_period_start` (timestamptz, from Stripe)
      - `current_period_end` (timestamptz, from Stripe)
      - `organization_id` (text, optional organization reference)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  3. Security
    - Enable RLS on `subscription_events` table
    - Add policies for authenticated users to read their own events
    - Add policies for service role to insert/update events (for webhooks)
    - Add updated_at trigger for automatic timestamp updates

  4. Indexes
    - Performance indexes for user lookups and subscription queries
*/

-- Add stripe_email column to clients table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'stripe_email'
  ) THEN
    ALTER TABLE clients ADD COLUMN stripe_email text;
  END IF;
END $$;

-- Create subscription_events table
CREATE TABLE IF NOT EXISTS subscription_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id text,
  customer_id text,
  payment_status text,
  checkout_session_id text,
  stripe_email text,
  amount integer, -- in cents
  currency text DEFAULT 'usd',
  interval text, -- billing interval (week, month, year)
  invoice_id text,
  subscription_status text,
  cancel_at_period_end boolean DEFAULT false,
  canceled_at timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  organization_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on subscription_events
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_events
CREATE POLICY "Users can read own subscription events"
  ON subscription_events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert subscription events"
  ON subscription_events
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update subscription events"
  ON subscription_events
  FOR UPDATE
  TO service_role
  USING (true);

CREATE POLICY "Service role can read all subscription events"
  ON subscription_events
  FOR SELECT
  TO service_role
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscription_events_user_id ON subscription_events(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_subscription_id ON subscription_events(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_customer_id ON subscription_events(customer_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_checkout_session ON subscription_events(checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_status ON subscription_events(subscription_status);
CREATE INDEX IF NOT EXISTS idx_subscription_events_created_at ON subscription_events(created_at);

-- Add updated_at trigger for subscription_events
CREATE TRIGGER update_subscription_events_updated_at 
    BEFORE UPDATE ON subscription_events 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add index on clients stripe_email for faster lookups
CREATE INDEX IF NOT EXISTS idx_clients_stripe_email ON clients(stripe_email);