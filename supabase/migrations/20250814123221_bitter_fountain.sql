/*
  # Create Investor Database Schema

  1. New Tables
    - `investors`
      - `id` (uuid, primary key)
      - `name` (text, investor/firm name)
      - `type` (text, individual/vc/angel/pe)
      - `email` (text, contact email)
      - `website` (text, optional website)
      - `description` (text, investor bio/description)
      - `investment_range_min` (bigint, minimum investment amount)
      - `investment_range_max` (bigint, maximum investment amount)
      - `preferred_stages` (text array, investment stages they prefer)
      - `preferred_industries` (text array, industries they invest in)
      - `preferred_company_types` (text array, LLC/C Corp/LP preferences)
      - `geographic_focus` (text array, countries/regions they focus on)
      - `portfolio_companies` (text array, optional list of portfolio companies)
      - `notable_investments` (text, optional notable investments description)
      - `investment_criteria` (text, specific criteria or requirements)
      - `response_time` (text, typical response time)
      - `last_active` (timestamptz, when they were last active)
      - `is_active` (boolean, whether they're currently investing)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `startup_submissions`
      - `id` (uuid, primary key)
      - `company_name` (text)
      - `company_type` (text)
      - `category` (text)
      - `funding_required` (bigint)
      - `investment_stage` (text)
      - `business_description` (text)
      - `country` (text)
      - `state` (text)
      - `city` (text)
      - `email` (text)
      - `matches_sent` (boolean, whether matches have been sent)
      - `created_at` (timestamptz)

    - `investor_matches`
      - `id` (uuid, primary key)
      - `submission_id` (uuid, foreign key to startup_submissions)
      - `investor_id` (uuid, foreign key to investors)
      - `match_score` (integer, 1-100 match percentage)
      - `match_reasons` (text array, reasons for the match)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access
    - Public read access for investor data (for matching)
    - Secure submission and match data

  3. Indexes
    - Performance indexes for matching queries
    - Search indexes for investor discovery
*/

-- Create investors table
CREATE TABLE IF NOT EXISTS investors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('individual', 'vc', 'angel', 'pe', 'family_office', 'corporate')),
  email text,
  website text,
  description text,
  investment_range_min bigint DEFAULT 0,
  investment_range_max bigint,
  preferred_stages text[] DEFAULT '{}',
  preferred_industries text[] DEFAULT '{}',
  preferred_company_types text[] DEFAULT '{}',
  geographic_focus text[] DEFAULT '{}',
  portfolio_companies text[] DEFAULT '{}',
  notable_investments text,
  investment_criteria text,
  response_time text DEFAULT 'within_week',
  last_active timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create startup submissions table
CREATE TABLE IF NOT EXISTS startup_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  company_type text NOT NULL,
  category text NOT NULL,
  funding_required bigint NOT NULL,
  investment_stage text NOT NULL,
  business_description text NOT NULL,
  country text NOT NULL,
  state text NOT NULL,
  city text NOT NULL,
  email text NOT NULL,
  matches_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create investor matches table
CREATE TABLE IF NOT EXISTS investor_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid REFERENCES startup_submissions(id) ON DELETE CASCADE,
  investor_id uuid REFERENCES investors(id) ON DELETE CASCADE,
  match_score integer CHECK (match_score >= 0 AND match_score <= 100),
  match_reasons text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE startup_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for investors (public read for matching)
CREATE POLICY "Anyone can read active investors"
  ON investors
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage investors"
  ON investors
  FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for startup submissions
CREATE POLICY "Users can create submissions"
  ON startup_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read all submissions"
  ON startup_submissions
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for investor matches
CREATE POLICY "Authenticated users can manage matches"
  ON investor_matches
  FOR ALL
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_investors_active ON investors(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_investors_stages ON investors USING GIN(preferred_stages);
CREATE INDEX IF NOT EXISTS idx_investors_industries ON investors USING GIN(preferred_industries);
CREATE INDEX IF NOT EXISTS idx_investors_company_types ON investors USING GIN(preferred_company_types);
CREATE INDEX IF NOT EXISTS idx_investors_geographic ON investors USING GIN(geographic_focus);
CREATE INDEX IF NOT EXISTS idx_investors_funding_range ON investors(investment_range_min, investment_range_max);

CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON startup_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_submissions_matches_sent ON startup_submissions(matches_sent);

CREATE INDEX IF NOT EXISTS idx_matches_submission ON investor_matches(submission_id);
CREATE INDEX IF NOT EXISTS idx_matches_investor ON investor_matches(investor_id);
CREATE INDEX IF NOT EXISTS idx_matches_score ON investor_matches(match_score DESC);

-- Create updated_at trigger for investors
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_investors_updated_at 
    BEFORE UPDATE ON investors 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();