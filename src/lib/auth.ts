import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { NextApiRequest } from "next";

let cached: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY (legacy: SUPABASE_SERVICE_ROLE_KEY). Set them in .env before calling auth-protected routes."
    );
  }
  cached = createClient(url, key);
  return cached;
}

export async function requireSupabaseUser(req: NextApiRequest) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice("Bearer ".length) : null;
  if (!token) return { user: null, error: "Missing bearer token" };

  try {
    const { data, error } = await getSupabaseAdmin().auth.getUser(token);
    if (error || !data?.user) return { user: null, error: "Invalid token" };
    return { user: data.user, error: null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Auth client unavailable";
    return { user: null, error: msg };
  }
}
