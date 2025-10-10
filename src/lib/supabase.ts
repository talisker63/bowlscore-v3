import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  email: string;
  name?: string;
  provider: string;
  created_at: string;
}

export interface Drill {
  id: string;
  title: string;
  slug: string;
  description: string;
  instructions: string;
  hero_image_url?: string;
  video_url?: string;
  is_premium: boolean;
  created_at: string;
}

export interface Scorecard {
  id: string;
  user_id: string;
  drill_id?: string;
  data_json: {
    players: Array<{ name: string; scores: number[] }>;
    numEnds: number;
    createdAt: string;
  };
  jpeg_url?: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  provider: string;
  provider_customer_id?: string;
  provider_sub_id?: string;
  status: string;
  current_period_end?: string;
  created_at: string;
  updated_at: string;
}

export interface DiscountRequest {
  id: string;
  user_id?: string;
  email_entered: string;
  name: string;
  reason: string;
  status: string;
  approval_token: string;
  stripe_coupon_id?: string;
  stripe_promo_code?: string;
  approved_at?: string;
  created_at: string;
}
