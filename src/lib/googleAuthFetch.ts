import { supabase } from "@/lib/supabaseClient";
import { isDevAuthEnabled, devSignIn } from "@/lib/devAuth";

// Stable redirect URL so the value registered in Supabase + Google Cloud doesn't
// drift when Next.js falls back to a different dev port (3000 → 3002, etc).
function getRedirectOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:3000";
}

export const handleGoogleSignIn = async () => {
  // Dev mode: skip the real OAuth round-trip entirely.
  if (isDevAuthEnabled()) {
    devSignIn();
    window.location.replace("/dashboard");
    return;
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${getRedirectOrigin()}/callback` },
  });

  if (error) {
    console.error("Error during sign-in:", error.message);
    return;
  }

  supabase.auth.onAuthStateChange(async (_event, session) => {
    if (!session) return;
    const userEmail = session.user.email ?? "";
    const domain = userEmail.split("@")[1]?.toLowerCase().trim() ?? "";

    if (domain !== "umass.edu") {
      await supabase.auth.signOut();
      alert("Access restricted to umass.edu emails only.");
      window.location.replace(getRedirectOrigin());
      return;
    }
    window.location.replace("/dashboard");
  });
};

