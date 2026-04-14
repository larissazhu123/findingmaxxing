"use client";
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/router";

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const userEmail = session.user.email!;
      const domain = userEmail.split("@")[1].toLowerCase();

      if (domain !== "umass.edu") {
        await supabase.auth.signOut();
        alert("Access restricted to umass.edu emails only.");
        return router.replace("/");
      }
      console.log("Login successful — redirecting to non existent dashboard right now.");
      alert("Login successful!");
      router.replace("/");
    };

    handleAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Finishing login...</p>
    </div>
  );
}
