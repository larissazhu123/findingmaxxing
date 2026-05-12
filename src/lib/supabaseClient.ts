import { createClient, type SupabaseClient } from "@supabase/supabase-js";
// If you have generated DB types, import them and use SupabaseClient<Database>
/* import type { Database } from "./database.types"; */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/+$/, "");
const publicKey = (
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  ""
).trim();

if (!url) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL. Add it to .env (Supabase → Settings → API → Project URL)."
  );
}

if (!publicKey) {
  console.warn(
    "[findingmaxxing] Set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or legacy NEXT_PUBLIC_SUPABASE_ANON_KEY) in .env. Login and DB calls will fail until it is set."
  );
}

export const supabase: SupabaseClient /* <Database> */ = createClient(
  url,
  publicKey || "placeholder-set-NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY-in-env"
);
