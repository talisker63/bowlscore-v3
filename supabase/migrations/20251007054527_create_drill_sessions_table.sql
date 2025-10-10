/*
  # Create drill_sessions table for 40 Bowls Draw Drill

  1. New Tables
    - `drill_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `drill_type` (text) - type of drill (e.g., '40-bowls-draw')
      - `player_name` (text) - name of the player
      - `session_date` (date) - date of the practice session
      - `surface` (text) - surface type (grass, synthetic, indoor)
      - `weather` (text) - weather conditions
      - `notes` (text) - session notes
      - `ends_data` (jsonb) - complete drill data including all bowl results
      - `total_bowls` (integer) - total number of bowls
      - `successful_bowls` (integer) - number of successful bowls
      - `success_percentage` (integer) - success percentage
      - `image_url` (text) - URL of the saved scorecard image
      - `stats_data` (jsonb) - detailed statistics
      - `created_at` (timestamptz) - when the session was created
      - `updated_at` (timestamptz) - when the session was last updated

  2. Storage
    - Create 'scorecards' bucket for storing scorecard images
    - Enable public access for scorecard images

  3. Security
    - Enable RLS on `drill_sessions` table
    - Add policy for users to read their own sessions
    - Add policy for users to insert their own sessions
    - Add policy for users to delete their own sessions
    - Add storage policy for authenticated users to upload scorecards
    - Add storage policy for public read access to scorecards
*/

-- Create drill_sessions table
CREATE TABLE IF NOT EXISTS drill_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  drill_type text NOT NULL,
  player_name text,
  session_date date,
  surface text,
  weather text,
  notes text,
  ends_data jsonb,
  total_bowls integer DEFAULT 0,
  successful_bowls integer DEFAULT 0,
  success_percentage integer DEFAULT 0,
  image_url text,
  stats_data jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_drill_sessions_user_id ON drill_sessions(user_id);

-- Create index on drill_type for filtering
CREATE INDEX IF NOT EXISTS idx_drill_sessions_drill_type ON drill_sessions(drill_type);

-- Create index on session_date for sorting
CREATE INDEX IF NOT EXISTS idx_drill_sessions_date ON drill_sessions(session_date DESC);

-- Enable RLS
ALTER TABLE drill_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own drill sessions
CREATE POLICY "Users can read own drill sessions"
  ON drill_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own drill sessions
CREATE POLICY "Users can insert own drill sessions"
  ON drill_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own drill sessions
CREATE POLICY "Users can update own drill sessions"
  ON drill_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own drill sessions
CREATE POLICY "Users can delete own drill sessions"
  ON drill_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create scorecards storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('scorecards', 'scorecards', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Authenticated users can upload to their own folder
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can upload own scorecards'
  ) THEN
    CREATE POLICY "Users can upload own scorecards"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'scorecards' AND
        (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;

-- Storage policy: Anyone can view scorecards (public bucket)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Scorecards are publicly accessible'
  ) THEN
    CREATE POLICY "Scorecards are publicly accessible"
      ON storage.objects
      FOR SELECT
      TO public
      USING (bucket_id = 'scorecards');
  END IF;
END $$;

-- Storage policy: Users can delete their own scorecards
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can delete own scorecards'
  ) THEN
    CREATE POLICY "Users can delete own scorecards"
      ON storage.objects
      FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'scorecards' AND
        (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;
