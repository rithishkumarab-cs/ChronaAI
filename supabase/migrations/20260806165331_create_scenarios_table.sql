/*
# Create scenarios table (single-tenant, no auth)

1. New Tables
- `scenarios`
  - `id` (uuid, primary key)
  - `name` (text, scenario label)
  - `inputs` (jsonb, financial parameters: balance, income, emi, emi_day, daily_spend, etc.)
  - `is_optimized` (boolean, whether the optimal strategy was executed)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)
2. Security
- Enable RLS on `scenarios`.
- Allow anon + authenticated full CRUD because this is a single-tenant demo with no sign-in.
*/

CREATE TABLE IF NOT EXISTS scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'My Scenario',
  inputs jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_optimized boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_scenarios" ON scenarios;
CREATE POLICY "anon_select_scenarios" ON scenarios FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_scenarios" ON scenarios;
CREATE POLICY "anon_insert_scenarios" ON scenarios FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_scenarios" ON scenarios;
CREATE POLICY "anon_update_scenarios" ON scenarios FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_scenarios" ON scenarios;
CREATE POLICY "anon_delete_scenarios" ON scenarios FOR DELETE
  TO anon, authenticated USING (true);
