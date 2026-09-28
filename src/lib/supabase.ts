import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Thiếu VITE_SUPABASE_URL trong .env.local");
}

if (!supabaseAnonKey) {
  throw new Error("Thiếu VITE_SUPABASE_ANON_KEY trong .env.local");
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
);