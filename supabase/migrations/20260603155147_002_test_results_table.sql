/*
  # Create test_results table

  1. New Tables
    - `test_results`
      - `id` (uuid, primary key)
      - `user_id` (text, references user uid from Firebase Auth)
      - `test_id` (text, test identifier)
      - `title` (text, test title)
      - `score` (numeric, raw score)
      - `max_score` (numeric, maximum possible score)
      - `percentage` (numeric, score percentage)
      - `correct` (integer, correct answers count)
      - `wrong` (integer, wrong answers count)
      - `skipped` (integer, skipped questions count)
      - `date` (text, ISO date string)
      - `created_at` (timestamptz, auto-set)

  2. Security
    - Enable RLS on `test_results` table
    - Authenticated users can insert and read their own results
    - Users cannot read other users' results

  3. Notes
    - user_id is text (not uuid) to match Firebase Auth UIDs
    - resultService.js saves to this table with localStorage fallback
*/

CREATE TABLE IF NOT EXISTS test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  test_id text,
  title text DEFAULT '',
  score numeric DEFAULT 0,
  max_score numeric DEFAULT 0,
  percentage numeric DEFAULT 0,
  correct integer DEFAULT 0,
  wrong integer DEFAULT 0,
  skipped integer DEFAULT 0,
  date text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own test results"
  ON test_results FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can read own test results"
  ON test_results FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_test_results_created_at ON test_results(created_at DESC);
