/*
  # Create Lawn Bowls Training & Scorecard Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `name` (text)
      - `provider` (text) - 'email' or 'google'
      - `created_at` (timestamptz)
    
    - `drills`
      - `id` (uuid, primary key)
      - `title` (text)
      - `slug` (text, unique)
      - `description` (text)
      - `instructions` (text)
      - `hero_image_url` (text)
      - `video_url` (text, nullable)
      - `is_premium` (boolean)
      - `created_at` (timestamptz)
    
    - `scorecards`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `drill_id` (uuid, references drills, nullable)
      - `data_json` (jsonb) - stores player names, scores, settings
      - `jpeg_url` (text, nullable)
      - `created_at` (timestamptz)
    
    - `subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles, unique)
      - `provider` (text) - 'stripe' or 'paypal'
      - `provider_customer_id` (text)
      - `provider_sub_id` (text)
      - `status` (text) - 'active', 'trialing', 'canceled', 'past_due'
      - `current_period_end` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `discount_requests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles, nullable)
      - `email_entered` (text)
      - `name` (text)
      - `reason` (text)
      - `status` (text) - 'pending', 'approved', 'declined'
      - `approval_token` (uuid)
      - `stripe_coupon_id` (text, nullable)
      - `stripe_promo_code` (text, nullable)
      - `approved_at` (timestamptz, nullable)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read their own data
    - Add policies for public drill access
    - Add restrictive policies for subscriptions and discount_requests
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text,
  provider text DEFAULT 'email',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create drills table
CREATE TABLE IF NOT EXISTS drills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  instructions text NOT NULL,
  hero_image_url text,
  video_url text,
  is_premium boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE drills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view drills"
  ON drills FOR SELECT
  TO authenticated, anon
  USING (true);

-- Create scorecards table
CREATE TABLE IF NOT EXISTS scorecards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  drill_id uuid REFERENCES drills(id) ON DELETE SET NULL,
  data_json jsonb NOT NULL,
  jpeg_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE scorecards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scorecards"
  ON scorecards FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scorecards"
  ON scorecards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scorecards"
  ON scorecards FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scorecards"
  ON scorecards FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  provider text NOT NULL,
  provider_customer_id text,
  provider_sub_id text,
  status text DEFAULT 'inactive',
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create discount_requests table
CREATE TABLE IF NOT EXISTS discount_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  email_entered text NOT NULL,
  name text NOT NULL,
  reason text NOT NULL,
  status text DEFAULT 'pending',
  approval_token uuid DEFAULT gen_random_uuid(),
  stripe_coupon_id text,
  stripe_promo_code text,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE discount_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own discount requests"
  ON discount_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR email_entered = (SELECT email FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Anyone can insert discount requests"
  ON discount_requests FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for subscriptions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_subscriptions_updated_at'
  ) THEN
    CREATE TRIGGER update_subscriptions_updated_at
      BEFORE UPDATE ON subscriptions
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;