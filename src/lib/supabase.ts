import { createClient } from "@supabase/supabase-js";

// We use import.meta.env for Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder-url.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-anon-key";

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Charity = {
  id: string;
  name: string;
  tag: string;
  description: string;
  image_url: string;
  active: boolean;
  created_at: string;
};

export type UserProfile = {
  id: string;
  subscription_status: string;
  stripe_customer_id: string | null;
  chosen_charity_id: string | null;
  charity_allocation_pct: number;
  created_at: string;
};
