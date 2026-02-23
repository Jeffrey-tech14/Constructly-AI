import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { getEnv } from "@/utils/envConfig";
import { createCookieStorage } from "./cookieStorage";

const supabaseUrl =
  getEnv("NEXT_PUBLIC_SUPABASE_URL") || getEnv("VITE_SUPABASE_URL");
const supabaseAnonKey =
  getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY") || getEnv("VITE_SUPABASE_ANON_KEY");
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY (Next.js) OR VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (Vite).",
  );
}

// Initialize cookie-based storage for secure token persistence
const cookieStorage = createCookieStorage();

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Use secure HTTP-only cookies (HTTPS only) instead of localStorage
    storage: cookieStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
  db: {
    schema: "public",
  },
  global: {
    headers: { "x-jtech-ai": "jtechai" },
  },
});
