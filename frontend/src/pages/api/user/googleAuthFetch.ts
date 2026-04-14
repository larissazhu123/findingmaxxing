import { supabase } from "@/lib/supabaseClient";
import { Session } from "@supabase/supabase-js";

export const handleGoogleSignIn = async () => {
  console.log("Google sign in clicked");

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/callback`,
    },
  });

  if (error) {
    console.error("Error during sign-in:", error.message);
    return;
  }

  supabase.auth.onAuthStateChange(async (_event, session: Session | null) => {
    if (session) {
      const userEmail = session.user.email!;
      const domain = userEmail.split("@")[1].toLowerCase().trim();

      if (domain !== "umass.edu") {
        await supabase.auth.signOut();
        alert("Access restricted to umass.edu emails only.");
        window.location.replace(window.location.origin);
      } else {
        window.location.replace("/");
      }
    }
  });
};
