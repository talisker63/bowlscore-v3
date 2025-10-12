# Database Schema Documentation

## Overview

BowlScore uses Supabase (PostgreSQL) as its database. The schema is designed to support user authentication, subscription management, scorecard tracking, drill sessions, and discount requests.

## Schema Diagram

```
┌─────────────┐
│ auth.users  │ (Managed by Supabase)
└──────┬──────┘
       │
       │ (1:1)
       ↓
┌─────────────┐      (1:1)      ┌──────────────┐
│  profiles   │◄─────────────────┤subscriptions │
└──────┬──────┘                  └──────────────┘
       │
       │ (1:N)
       ├─────────────┐
       ↓             ↓
┌─────────────┐ ┌──────────────────┐
│ scorecards  │ │  drill_sessions  │
└─────────────┘ └──────────────────┘
       │               │
       ↓               ├──→ lead_vs_lead_sessions
    ┌──────┐          ├──→ seconds_chance_sessions
    │drills│          └──→ (drill_type = '40-bowls-draw')
    └──────┘

┌───────────────────┐
│discount_requests  │ (Optional link to profiles)
└───────────────────┘
```

## Tables

### 1. profiles

Stores user profile information. Links to Supabase Auth users.

```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text,
  provider text DEFAULT 'email',
  created_at timestamptz DEFAULT now()
);
```

**Fields:**
- `id` (uuid, PK): References auth.users.id
- `email` (text, required): User's email address
- `name` (text): User's display name
- `provider` (text): Authentication provider ('email' or 'google')
- `created_at` (timestamptz): Profile creation timestamp

**RLS Policies:**
- Users can view their own profile
- Users can update their own profile
- Users can insert their own profile (during registration)

**Indexes:**
- Primary key on `id`

**Notes:**
- This table does NOT have an `is_premium` field
- Premium status is determined by the `subscriptions` table
- One-to-one relationship with auth.users

---

### 2. subscriptions

Tracks user subscription status for premium features.

```sql
CREATE TABLE subscriptions (
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
```

**Fields:**
- `id` (uuid, PK): Unique subscription ID
- `user_id` (uuid, unique, FK): References profiles.id
- `provider` (text): Payment provider ('stripe' or 'paypal')
- `provider_customer_id` (text): Stripe customer ID
- `provider_sub_id` (text): Stripe subscription ID
- `status` (text): Subscription status
  - `'active'`: Paid and active
  - `'trialing'`: In trial period
  - `'canceled'`: Canceled
  - `'past_due'`: Payment failed
  - `'inactive'`: No subscription
- `current_period_end` (timestamptz): When current period ends
- `created_at` (timestamptz): Record creation time
- `updated_at` (timestamptz): Last update time

**RLS Policies:**
- Users can view their own subscription only

**Indexes:**
- Primary key on `id`
- Unique constraint on `user_id`

**Triggers:**
- `update_updated_at`: Automatically updates `updated_at` on changes

**Premium Logic:**
```typescript
isPremium = status === 'active' || status === 'trialing'
```

---

### 3. scorecards

Stores traditional lawn bowls scorecard data.

```sql
CREATE TABLE scorecards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  drill_id uuid REFERENCES drills(id) ON DELETE SET NULL,
  data_json jsonb NOT NULL,
  jpeg_url text,
  created_at timestamptz DEFAULT now()
);
```

**Fields:**
- `id` (uuid, PK): Unique scorecard ID
- `user_id` (uuid, FK): References profiles.id
- `drill_id` (uuid, FK): Optional reference to drills table
- `data_json` (jsonb): Complete scorecard data
  ```json
  {
    "playersPerTeam": [1, 1],
    "endsCount": 18,
    "playerNames": ["Player 1", "Player 2"],
    "teamNames": ["Team A", "Team B"],
    "handicaps": {},
    "scores": [[0, 1, 2, ...], [1, 0, 1, ...]]
  }
  ```
- `jpeg_url` (text): URL to stored scorecard image
- `created_at` (timestamptz): When scorecard was saved

**RLS Policies:**
- Users can view their own scorecards
- Users can insert their own scorecards
- Users can update their own scorecards
- Users can delete their own scorecards

**Indexes:**
- Primary key on `id`
- Index on `user_id` for fast user queries

---

### 4. drill_sessions

Stores 40 Bowls Draw drill session data.

```sql
CREATE TABLE drill_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  drill_type text NOT NULL,
  player_name text,
  session_date text,
  surface text,
  weather text,
  notes text,
  ends_data jsonb NOT NULL,
  total_bowls integer DEFAULT 0,
  successful_bowls integer DEFAULT 0,
  success_percentage integer DEFAULT 0,
  image_url text,
  stats_data jsonb,
  created_at timestamptz DEFAULT now()
);
```

**Fields:**
- `id` (uuid, PK): Unique session ID
- `user_id` (uuid, FK): References profiles.id
- `drill_type` (text): Type of drill ('40-bowls-draw')
- `player_name` (text): Player's name
- `session_date` (text): Date of session
- `surface` (text): Playing surface type
- `weather` (text): Weather conditions
- `notes` (text): User notes
- `ends_data` (jsonb): Detailed end-by-end data
- `total_bowls` (integer): Total bowls thrown
- `successful_bowls` (integer): Number of successful bowls
- `success_percentage` (integer): Success rate
- `image_url` (text): URL to stored session image
- `stats_data` (jsonb): Detailed statistics
- `created_at` (timestamptz): Session creation time

**RLS Policies:**
- Users can view their own sessions
- Users can insert their own sessions
- Users can update their own sessions
- Users can delete their own sessions

**Indexes:**
- Primary key on `id`
- Index on `user_id`
- Index on `drill_type` for filtering

---

### 5. lead_vs_lead_sessions

Stores Lead vs Lead drill session data.

```sql
CREATE TABLE lead_vs_lead_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  player_a_name text NOT NULL,
  player_b_name text NOT NULL,
  session_date text NOT NULL,
  weather text[] DEFAULT '{}',
  green_speed text,
  bowls_per_player integer DEFAULT 4,
  number_of_ends integer DEFAULT 10,
  ends_data jsonb NOT NULL,
  player_a_final_score integer DEFAULT 0,
  player_b_final_score integer DEFAULT 0,
  winner text,
  player_a_total_held integer DEFAULT 0,
  player_b_total_held integer DEFAULT 0,
  player_a_total_penalties integer DEFAULT 0,
  player_b_total_penalties integer DEFAULT 0,
  image_url text,
  created_at timestamptz DEFAULT now()
);
```

**Fields:**
- `id` (uuid, PK): Unique session ID
- `user_id` (uuid, FK): References profiles.id
- `player_a_name` (text): Name of player A
- `player_b_name` (text): Name of player B
- `session_date` (text): Date of session
- `weather` (text[]): Array of weather conditions
- `green_speed` (text): Surface/green speed
- `bowls_per_player` (integer): Bowls per player (2-4)
- `number_of_ends` (integer): Total ends played
- `ends_data` (jsonb): Complete end-by-end results
- `player_a_final_score` (integer): Player A's total score
- `player_b_final_score` (integer): Player B's total score
- `winner` (text): Winning player name
- `player_a_total_held` (integer): Total good shots for A
- `player_b_total_held` (integer): Total good shots for B
- `player_a_total_penalties` (integer): Total penalties for A
- `player_b_total_penalties` (integer): Total penalties for B
- `image_url` (text): URL to stored session image
- `created_at` (timestamptz): Session creation time

**RLS Policies:**
- Users can view their own sessions
- Users can insert their own sessions

**Indexes:**
- Primary key on `id`
- Index on `user_id`

---

### 6. seconds_chance_sessions

Stores 2nd's Chance drill session data.

```sql
CREATE TABLE seconds_chance_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  player_a_name text NOT NULL,
  player_b_name text NOT NULL,
  session_date text NOT NULL,
  weather text[] DEFAULT '{}',
  surface_type text,
  bowls_per_player integer DEFAULT 4,
  number_of_ends integer DEFAULT 10,
  ends_data jsonb NOT NULL,
  player_a_final_score integer DEFAULT 0,
  player_b_final_score integer DEFAULT 0,
  winner text,
  player_a_total_successful integer DEFAULT 0,
  player_b_total_successful integer DEFAULT 0,
  player_a_forehand_success integer DEFAULT 0,
  player_a_backhand_success integer DEFAULT 0,
  player_b_forehand_success integer DEFAULT 0,
  player_b_backhand_success integer DEFAULT 0,
  image_url text,
  created_at timestamptz DEFAULT now()
);
```

**Fields:**
- `id` (uuid, PK): Unique session ID
- `user_id` (uuid, FK): References profiles.id
- `player_a_name` (text): Name of player A
- `player_b_name` (text): Name of player B
- `session_date` (text): Date of session
- `weather` (text[]): Array of weather conditions
- `surface_type` (text): Surface type
- `bowls_per_player` (integer): Bowls per player (2 or 4)
- `number_of_ends` (integer): Total ends played
- `ends_data` (jsonb): Complete end-by-end results
- `player_a_final_score` (integer): Player A's total score
- `player_b_final_score` (integer): Player B's total score
- `winner` (text): Winning player name
- `player_a_total_successful` (integer): Total successful for A
- `player_b_total_successful` (integer): Total successful for B
- `player_a_forehand_success` (integer): A's forehand successes
- `player_a_backhand_success` (integer): A's backhand successes
- `player_b_forehand_success` (integer): B's forehand successes
- `player_b_backhand_success` (integer): B's backhand successes
- `image_url` (text): URL to stored session image
- `created_at` (timestamptz): Session creation time

**RLS Policies:**
- Users can view their own sessions
- Users can insert their own sessions

**Indexes:**
- Primary key on `id`
- Index on `user_id`

---

### 7. drills

Reference table for drill types (currently not heavily used).

```sql
CREATE TABLE drills (
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
```

**Fields:**
- `id` (uuid, PK): Unique drill ID
- `title` (text): Drill title
- `slug` (text, unique): URL-friendly slug
- `description` (text): Short description
- `instructions` (text): Detailed instructions
- `hero_image_url` (text): Hero image URL
- `video_url` (text): Tutorial video URL
- `is_premium` (boolean): Whether drill requires premium
- `created_at` (timestamptz): Creation timestamp

**RLS Policies:**
- Anyone (authenticated or not) can view drills

---

### 8. discount_requests

Tracks user requests for subscription discounts.

```sql
CREATE TABLE discount_requests (
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
```

**Fields:**
- `id` (uuid, PK): Unique request ID
- `user_id` (uuid, FK): Optional reference to profiles
- `email_entered` (text): Email address provided
- `name` (text): Requester's name
- `reason` (text): Reason for discount request
- `status` (text): Request status
  - `'pending'`: Awaiting review
  - `'approved'`: Discount granted
  - `'declined'`: Request denied
- `approval_token` (uuid): Unique token for approval link
- `stripe_coupon_id` (text): Stripe coupon ID if approved
- `stripe_promo_code` (text): Stripe promo code if approved
- `approved_at` (timestamptz): Approval timestamp
- `created_at` (timestamptz): Request creation time

**RLS Policies:**
- Users can view their own requests (by user_id or email)
- Anyone can insert requests (supports non-authenticated users)

---

## Storage Buckets

### scorecards

Stores JPEG images of scorecards and drill sessions.

**Configuration:**
- Public: Yes
- File size limit: 10MB
- Allowed MIME types: image/jpeg, image/jpg
- Path structure: `{user_id}/{timestamp}.jpg`

**RLS Policies:**
- Users can upload to their own folder
- Anyone can view (public bucket)

---

## Migrations

All migrations are located in `supabase/migrations/` and are applied in order:

1. `20251006053845_create_initial_schema.sql` - Initial tables and RLS
2. `20251007054527_create_drill_sessions_table.sql` - 40 Bowls Draw drill
3. `20251009010029_fix_security_and_performance_issues.sql` - Security enhancements
4. `20251009042847_add_trial_tracking.sql` - Trial period support
5. `20251009095009_create_lead_vs_lead_sessions_table.sql` - Lead vs Lead drill
6. `20251010034117_create_seconds_chance_sessions_table.sql` - 2nd's Chance drill

---

## Query Patterns

### Get User with Subscription
```typescript
const { user, profile, subscription } = useAuth();
const isPremium = subscription?.status === 'active' ||
                  subscription?.status === 'trialing';
```

### Save Drill Session
```typescript
const { error } = await supabase
  .from('lead_vs_lead_sessions')
  .insert({
    user_id: user.id,
    player_a_name: 'Player A',
    // ... other fields
  });
```

### Load User History
```typescript
const { data, error } = await supabase
  .from('drill_sessions')
  .select('*')
  .eq('user_id', user.id)
  .eq('drill_type', '40-bowls-draw')
  .order('created_at', { ascending: false })
  .limit(10);
```

### Check Premium Status
```typescript
const { data, error } = await supabase
  .from('subscriptions')
  .select('status')
  .eq('user_id', user.id)
  .maybeSingle();

const isPremium = data?.status === 'active' ||
                  data?.status === 'trialing';
```

---

## Performance Considerations

### Indexes
- All foreign keys are indexed automatically
- Additional indexes on `user_id` for all user-scoped tables
- Consider JSONB indexes if querying nested data frequently

### Query Optimization
- Use `.maybeSingle()` instead of `.single()` for optional records
- Always filter by `user_id` first for user-scoped data
- Use `.select('specific, fields')` instead of `.select('*')` for large tables

### Data Size Management
- JSONB fields can grow large; monitor storage usage
- Consider archiving old sessions after 1+ years
- Implement soft deletes if needed for audit trail

---

## Backup Strategy

### Supabase Automated Backups
- Daily automated backups (managed by Supabase)
- Point-in-time recovery available
- Backup retention per Supabase plan

### Manual Backup Considerations
- Export critical user data periodically
- Store migrations in version control
- Document restoration procedures

---

## Future Schema Enhancements

### Planned Tables
- `teams` - Team management
- `tournaments` - Tournament tracking
- `clubs` - Club/organization support
- `achievements` - Gamification
- `analytics_events` - User behavior tracking

### Planned Fields
- `profiles.preferences` (jsonb) - UI preferences
- `profiles.timezone` - User timezone
- `subscriptions.cancel_at_period_end` - Cancellation flag
- `subscriptions.trial_end` - Trial end date

### Planned Indexes
- JSONB indexes on `ends_data` for statistical queries
- Full-text search on notes and player names
- Composite indexes for common query patterns
