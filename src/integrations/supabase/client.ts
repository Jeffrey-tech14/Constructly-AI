<<<<<<< HEAD
import { createClient } from "@supabase/supabase-js"
import type { Database } from "./types"

const getEnv = (key: string) => {
  if (typeof process !== "undefined" && process.env?.[key]) {
    return process.env[key]
  }
  if (typeof import.meta !== "undefined" && import.meta.env?.[key]) {
    return import.meta.env[key]
  }
  return undefined
}

const supabaseUrl =
  getEnv("NEXT_PUBLIC_SUPABASE_URL") || getEnv("VITE_SUPABASE_URL")
const supabaseAnonKey =
  getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY") || getEnv("VITE_SUPABASE_ANON_KEY")

=======
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const getEnv = (key: string) => {
  if (typeof process !== "undefined" && process.env?.[key]) {
    return process.env[key];
  }
  if (typeof import.meta !== "undefined" && import.meta.env?.[key]) {
    return import.meta.env[key];
  }
  return undefined;
};

const supabaseUrl =
  getEnv("NEXT_PUBLIC_SUPABASE_URL") || getEnv("VITE_SUPABASE_URL");
const supabaseAnonKey =
  getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY") || getEnv("VITE_SUPABASE_ANON_KEY");
>>>>>>> c070c5125b2a47a53f0acc9e469ce7dfe0953e31

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY (Next.js) OR VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (Vite)."
<<<<<<< HEAD
  )
=======
  );
>>>>>>> c070c5125b2a47a53f0acc9e469ce7dfe0953e31
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
<<<<<<< HEAD
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: { 'x-application-name': 'your-app-name' }
  }
});
=======
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
  db: {
    schema: "public",
  },
  global: {
    headers: { "x-application-name": "your-app-name" },
  },
});
>>>>>>> c070c5125b2a47a53f0acc9e469ce7dfe0953e31
