/*
  Fix Security and Performance Issues

  1. Add Missing Foreign Key Indexes
  Foreign key columns without indexes can cause significant performance degradation during joins and cascading operations.
  
  New Indexes:
  - idx_discount_requests_user_id on discount_requests(user_id) - Improves query performance for user's discount requests
  - idx_scorecards_user_id on scorecards(user_id) - Improves query performance for user's scorecards
  - idx_scorecards_drill_id on scorecards(drill_id) - Improves query performance when filtering by drill

  2. Optimize RLS Policies with SELECT Subqueries
  RLS policies that call auth.uid() directly re-evaluate for each row, causing performance issues at scale.
  Wrapping in SELECT ensures the function is called once per query instead of once per row.
  
  Updated Policies:
  All RLS policies across the following tables have been optimized:
  - profiles - 3 policies (view, update, insert)
  - scorecards - 4 policies (view, insert, update, delete)
  - subscriptions - 1 policy (view)
  - discount_requests - 1 policy (view)
  - stripe_customers - 1 policy (view)
  - stripe_subscriptions - 1 policy (view)
  - stripe_orders - 1 policy (view)
  - drill_sessions - 4 policies (read, insert, update, delete)

  3. Fix Function Search Path
  The update_updated_at_column function has a mutable search_path which is a security risk.
  Set explicit search_path to prevent potential SQL injection attacks.

  4. Remove Unused Indexes
  Indexes that are never used consume storage and slow down write operations.
  - Remove idx_drill_sessions_user_id (duplicate of foreign key)
  - Remove idx_drill_sessions_date (not being used in queries)

  5. Security Notes
  - Leaked Password Protection must be enabled in Supabase Dashboard under Authentication Providers Email
  - This cannot be done via SQL migration
*/

-- ====================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- ====================

-- Add index for discount_requests.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_discount_requests_user_id ON discount_requests(user_id);

-- Add index for scorecards.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_scorecards_user_id ON scorecards(user_id);

-- Add index for scorecards.drill_id foreign key
CREATE INDEX IF NOT EXISTS idx_scorecards_drill_id ON scorecards(drill_id);

-- ====================
-- 2. OPTIMIZE RLS POLICIES
-- ====================

-- Drop and recreate profiles policies with optimized auth.uid()
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

-- Drop and recreate scorecards policies with optimized auth.uid()
DROP POLICY IF EXISTS "Users can view own scorecards" ON scorecards;
CREATE POLICY "Users can view own scorecards"
  ON scorecards FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own scorecards" ON scorecards;
CREATE POLICY "Users can insert own scorecards"
  ON scorecards FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own scorecards" ON scorecards;
CREATE POLICY "Users can update own scorecards"
  ON scorecards FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own scorecards" ON scorecards;
CREATE POLICY "Users can delete own scorecards"
  ON scorecards FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Drop and recreate subscriptions policy with optimized auth.uid()
DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Drop and recreate discount_requests policy with optimized auth.uid()
DROP POLICY IF EXISTS "Users can view own discount requests" ON discount_requests;
CREATE POLICY "Users can view own discount requests"
  ON discount_requests FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id OR email_entered = (SELECT email FROM profiles WHERE id = (SELECT auth.uid())));

-- Drop and recreate stripe_customers policy with optimized auth.uid()
DROP POLICY IF EXISTS "Users can view their own customer data" ON stripe_customers;
CREATE POLICY "Users can view their own customer data"
  ON stripe_customers FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Drop and recreate stripe_subscriptions policy with optimized auth.uid()
DROP POLICY IF EXISTS "Users can view their own subscription data" ON stripe_subscriptions;
CREATE POLICY "Users can view their own subscription data"
  ON stripe_subscriptions FOR SELECT
  TO authenticated
  USING (customer_id IN (SELECT customer_id FROM stripe_customers WHERE user_id = (SELECT auth.uid())));

-- Drop and recreate stripe_orders policy with optimized auth.uid()
DROP POLICY IF EXISTS "Users can view their own order data" ON stripe_orders;
CREATE POLICY "Users can view their own order data"
  ON stripe_orders FOR SELECT
  TO authenticated
  USING (customer_id IN (SELECT customer_id FROM stripe_customers WHERE user_id = (SELECT auth.uid())));

-- Drop and recreate drill_sessions policies with optimized auth.uid()
DROP POLICY IF EXISTS "Users can read own drill sessions" ON drill_sessions;
CREATE POLICY "Users can read own drill sessions"
  ON drill_sessions FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own drill sessions" ON drill_sessions;
CREATE POLICY "Users can insert own drill sessions"
  ON drill_sessions FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own drill sessions" ON drill_sessions;
CREATE POLICY "Users can update own drill sessions"
  ON drill_sessions FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own drill sessions" ON drill_sessions;
CREATE POLICY "Users can delete own drill sessions"
  ON drill_sessions FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- ====================
-- 3. FIX FUNCTION SEARCH PATH
-- ====================

-- Recreate update_updated_at_column function with secure search_path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- ====================
-- 4. REMOVE UNUSED INDEXES
-- ====================

-- Drop unused indexes that are not improving query performance
DROP INDEX IF EXISTS idx_drill_sessions_user_id;
DROP INDEX IF EXISTS idx_drill_sessions_date;