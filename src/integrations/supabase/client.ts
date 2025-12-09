// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Universal environment getter — works on Vercel, Next.js, Vite, Node
const getEnv = (key: string) => {
  // 1. Node & Vercel
  if (typeof process !== "undefined" && process.env?.[key]) {
    return process.env[key];
  }

  // 2. Vite / Browser
  if (typeof import.meta !== "undefined" && import.meta.env?.[key]) {
    return import.meta.env[key];
  }

  return undefined;
};

const supabaseUrl =
  getEnv("NEXT_PUBLIC_SUPABASE_URL") ||
  getEnv("VITE_SUPABASE_URL") ||
  getEnv("SUPABASE_URL");

const supabaseAnonKey =
  getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY") ||
  getEnv("VITE_SUPABASE_ANON_KEY") ||
  getEnv("SUPABASE_ANON_KEY");

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase environment variables missing. Ensure they exist in Vercel/Next.js/Vite config."
  );
}

// No-op storage for non-browser environments (e.g., SSR)
const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== "undefined" ? window.localStorage : noopStorage,
  },
  db: {
    schema: "public",
  },
  global: {
    headers: { "x-jtech-ai": "jtechai-app" },
  },
});