/*
  # Create 2nd's Chance Sessions Table

  ## Overview
  This migration creates a table to store 2nd's Chance drill game sessions,
  a position-focused practice drill with alternating hand starts per end.

  ## New Tables
    - `seconds_chance_sessions`
      - `id` (uuid, primary key) - Unique identifier for each game session
      - `user_id` (uuid, foreign key) - References the user who created the session
      - `player_a_name` (text) - Name of Player A
      - `player_b_name` (text) - Name of Player B
      - `session_date` (text) - Date of the game session
      - `weather` (text[]) - Array of weather conditions during the game
      - `surface_type` (text) - Type of surface (grass, synthetic, weave)
      - `bowls_per_player` (integer) - Number of bowls per player per end (2 or 4)
      - `number_of_ends` (integer) - Total number of ends in the game
      - `ends_data` (jsonb) - Complete data for all ends including bowl results with hand tracking
      - `player_a_final_score` (integer) - Final cumulative score for Player A
      - `player_b_final_score` (integer) - Final cumulative score for Player B
      - `winner` (text) - Name of the winner or 'Draw'
      - `player_a_total_successful` (integer) - Total successful bowls by Player A
      - `player_b_total_successful` (integer) - Total successful bowls by Player B
      - `player_a_forehand_success` (integer) - Successful forehand bowls by Player A
      - `player_a_backhand_success` (integer) - Successful backhand bowls by Player A
      - `player_b_forehand_success` (integer) - Successful forehand bowls by Player B
      - `player_b_backhand_success` (integer) - Successful backhand bowls by Player B
      - `image_url` (text) - Base64 encoded JPEG image of the scorecard
      - `created_at` (timestamptz) - Timestamp when the session was created
      - `updated_at` (timestamptz) - Timestamp when the session was last updated

  ## Security
    - Enable RLS on `seconds_chance_sessions` table
    - Add policy for authenticated users to view their own sessions
    - Add policy for authenticated users to insert their own sessions
    - Add policy for authenticated users to update their own sessions
    - Add policy for authenticated users to delete their own sessions

  ## Performance
    - Create index on user_id for efficient query filtering
    - Create index on created_at for efficient sorting and pagination

  ## Notes
    - This table stores complete game data including all end results with hand tracking
    - Premium users can save unlimited game history
    - Non-premium users are restricted from saving sessions (enforced at application level)
    - The ends_data field stores complex JSON with bowl results including hand type per bowl
    - Hand alternation logic: odd ends Player A starts forehand, even ends Player B starts forehand
    - Scoring is simple: 1 point per successful bowl, no penalties
*/

CREATE TABLE IF NOT EXISTS seconds_chance_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player_a_name text NOT NULL,
  player_b_name text NOT NULL,
  session_date text NOT NULL,
  weather text[] DEFAULT '{}',
  surface_type text DEFAULT '',
  bowls_per_player integer NOT NULL DEFAULT 4,
  number_of_ends integer NOT NULL DEFAULT 10,
  ends_data jsonb NOT NULL DEFAULT '[]'::jsonb,
  player_a_final_score integer NOT NULL DEFAULT 0,
  player_b_final_score integer NOT NULL DEFAULT 0,
  winner text NOT NULL DEFAULT '',
  player_a_total_successful integer NOT NULL DEFAULT 0,
  player_b_total_successful integer NOT NULL DEFAULT 0,
  player_a_forehand_success integer NOT NULL DEFAULT 0,
  player_a_backhand_success integer NOT NULL DEFAULT 0,
  player_b_forehand_success integer NOT NULL DEFAULT 0,
  player_b_backhand_success integer NOT NULL DEFAULT 0,
  image_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE seconds_chance_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own seconds chance sessions"
  ON seconds_chance_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own seconds chance sessions"
  ON seconds_chance_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own seconds chance sessions"
  ON seconds_chance_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own seconds chance sessions"
  ON seconds_chance_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_seconds_chance_sessions_user_id ON seconds_chance_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_seconds_chance_sessions_created_at ON seconds_chance_sessions(created_at DESC);
