import { createClient } from "@supabase/supabase-js"
import type { Database } from "./types"

// Detect env provider (Next.js vs Vite)
const getEnv = (key: string) => {
  if (typeof process !== "undefined" && process.env?.[key]) {
    // Next.js / Node.js environment
    return process.env[key]
  }
  if (typeof import.meta !== "undefined" && import.meta.env?.[key]) {
    // Vite / Electron environment
    return import.meta.env[key]
  }
  return undefined
}

const supabaseUrl =
  getEnv("NEXT_PUBLIC_SUPABASE_URL") || getEnv("VITE_SUPABASE_URL")
const supabaseAnonKey =
  getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY") || getEnv("VITE_SUPABASE_ANON_KEY")

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY (Next.js) OR VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (Vite)."
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})
