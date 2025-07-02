import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  created_at: string;
  updated_at: string;
}

export interface TierList {
  id: string;
  tiers: Array<{
    name: string;
    items: string[];
  }>;
  bin: string[];
  classmate_name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  content: string;
  created_by: string;
  tier_id: string;
  classmate_name: string;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
} 