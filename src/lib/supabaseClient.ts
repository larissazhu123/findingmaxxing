import { createClient, type SupabaseClient } from "@supabase/supabase-js";
// If you have generated DB types, import them and use SupabaseClient<Database>
/* import type { Database } from "./database.types"; */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const anonFromEnv = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

// Missing anon breaks auth/data; placeholder only so imports succeed until you paste the real key from Supabase → Settings → API.
const anonKey =
  anonFromEnv || "placeholder-set-NEXT_PUBLIC_SUPABASE_ANON_KEY-in-env";

if (!url) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL. Add it to .env (Supabase → Settings → API → Project URL)."
  );
}

if (!anonFromEnv) {
  console.warn(
    "[findingmaxxing] Set NEXT_PUBLIC_SUPABASE_ANON_KEY in .env (Supabase → Settings → API → anon public). Login and DB calls will fail until it is set."
  );
}

export const supabase: SupabaseClient /* <Database> */ = createClient(url, anonKey);
