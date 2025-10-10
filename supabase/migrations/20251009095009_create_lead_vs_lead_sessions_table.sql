/*
  # Create Lead vs Lead Sessions Table

  ## Overview
  This migration creates a table to store Lead vs Lead drill game sessions.

  ## New Tables
    - `lead_vs_lead_sessions`
      - `id` (uuid, primary key) - Unique identifier for each game session
      - `user_id` (uuid, foreign key) - References the user who created the session
      - `player_a_name` (text) - Name of Player A
      - `player_b_name` (text) - Name of Player B
      - `session_date` (text) - Date of the game session
      - `weather` (text[]) - Array of weather conditions during the game
      - `green_speed` (text) - Speed of the green (slow, medium, fast, very-fast)
      - `bowls_per_player` (integer) - Number of bowls per player per end (2-4)
      - `number_of_ends` (integer) - Total number of ends in the game
      - `ends_data` (jsonb) - Complete data for all ends including bowl results
      - `player_a_final_score` (integer) - Final cumulative score for Player A
      - `player_b_final_score` (integer) - Final cumulative score for Player B
      - `winner` (text) - Name of the winner or 'Draw'
      - `player_a_total_held` (integer) - Total held shots by Player A
      - `player_b_total_held` (integer) - Total held shots by Player B
      - `player_a_total_penalties` (integer) - Total penalties (crossed + short) for Player A
      - `player_b_total_penalties` (integer) - Total penalties (crossed + short) for Player B
      - `image_url` (text) - Base64 encoded JPEG image of the scorecard
      - `created_at` (timestamptz) - Timestamp when the session was created
      - `updated_at` (timestamptz) - Timestamp when the session was last updated

  ## Security
    - Enable RLS on `lead_vs_lead_sessions` table
    - Add policy for authenticated users to view their own sessions
    - Add policy for authenticated users to insert their own sessions
    - Add policy for authenticated users to update their own sessions
    - Add policy for authenticated users to delete their own sessions

  ## Notes
    - This table stores complete game data including all end results
    - Premium users can save unlimited game history
    - Non-premium users should be restricted from saving sessions (enforced at application level)
    - The ends_data field stores complex JSON with bowl results and scoring per end
*/

CREATE TABLE IF NOT EXISTS lead_vs_lead_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player_a_name text NOT NULL,
  player_b_name text NOT NULL,
  session_date text NOT NULL,
  weather text[] DEFAULT '{}',
  green_speed text DEFAULT '',
  bowls_per_player integer NOT NULL DEFAULT 4,
  number_of_ends integer NOT NULL DEFAULT 10,
  ends_data jsonb NOT NULL DEFAULT '[]'::jsonb,
  player_a_final_score integer NOT NULL DEFAULT 0,
  player_b_final_score integer NOT NULL DEFAULT 0,
  winner text NOT NULL DEFAULT '',
  player_a_total_held integer NOT NULL DEFAULT 0,
  player_b_total_held integer NOT NULL DEFAULT 0,
  player_a_total_penalties integer NOT NULL DEFAULT 0,
  player_b_total_penalties integer NOT NULL DEFAULT 0,
  image_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE lead_vs_lead_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own lead vs lead sessions"
  ON lead_vs_lead_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lead vs lead sessions"
  ON lead_vs_lead_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lead vs lead sessions"
  ON lead_vs_lead_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own lead vs lead sessions"
  ON lead_vs_lead_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_lead_vs_lead_sessions_user_id ON lead_vs_lead_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_vs_lead_sessions_created_at ON lead_vs_lead_sessions(created_at DESC);
