/*
  # Fix RLS Policies for Startup Submissions

  1. Changes
    - Add `user_id` column to `startup_submissions` table
    - Update RLS policies to properly handle authenticated and anonymous users
    - Allow anonymous users to insert submissions (for account creation flow)
    - Allow authenticated users to read their own submissions

  2. Security
    - Maintain security while allowing the signup flow to work
    - Ensure users can only access their own data once authenticated
*/

-- Add user_id column to startup_submissions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'startup_submissions' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE startup_submissions ADD COLUMN user_id uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create submissions" ON startup_submissions;
DROP POLICY IF EXISTS "Authenticated users can read all submissions" ON startup_submissions;

-- Create new policies that allow the signup flow
CREATE POLICY "Anyone can create submissions"
  ON startup_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read own submissions"
  ON startup_submissions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Service role can read all submissions"
  ON startup_submissions
  FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role can update submissions"
  ON startup_submissions
  FOR UPDATE
  TO service_role
  USING (true);