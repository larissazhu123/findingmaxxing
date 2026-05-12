"use client";
import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  isDevAuthEnabled,
  isDevSignedIn,
  devSignOut,
  getDevNickname,
  setDevNickname as persistDevNickname,
  DEV_USER_PROFILE,
} from "@/lib/devAuth";

interface UserContextType {
  nickname: string;
  email: string;
  points: number;
  isReady: boolean;
  isLoggedIn: boolean;
  refreshNickname: () => Promise<void>;
  setNickname: (name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  nickname: "User",
  email: "",
  points: 0,
  isReady: false,
  isLoggedIn: false,
  refreshNickname: async () => {},
  setNickname: async () => {},
  signOut: async () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [nickname, setNicknameState] = useState("User");
  const [email, setEmail] = useState("");
  const [points, setPoints] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const applyDevProfile = useCallback(() => {
    setNicknameState(getDevNickname() || "Alex");
    setEmail(DEV_USER_PROFILE.email);
    setPoints(DEV_USER_PROFILE.points);
    setIsLoggedIn(true);
    setIsReady(true);
  }, []);

  const clearProfile = useCallback(() => {
    setNicknameState("User");
    setEmail("");
    setPoints(0);
    setIsLoggedIn(false);
    setIsReady(true);
  }, []);

  const loadNickname = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      if (!accessToken) {
        if (isDevAuthEnabled() && isDevSignedIn()) applyDevProfile();
        else clearProfile();
        return;
      }

      let res = await fetch("/api/user/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (res.status === 404) {
        const syncRes = await fetch("/api/auth/syncUser", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: session!.user.id, email: session!.user.email }),
        });
        if (!syncRes.ok) throw new Error("Failed to sync user profile");

        res = await fetch("/api/user/me", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      }

      if (!res.ok) throw new Error("Failed to fetch user profile");
      const data = await res.json();
      setNicknameState(data.username || "User");
      setEmail(data.email || "");
      setPoints(data.points || 0);
      setIsLoggedIn(true);
    } catch (err) {
      console.error("Failed to load profile:", err);
      if (isDevAuthEnabled() && isDevSignedIn()) applyDevProfile();
      else clearProfile();
    } finally {
      setIsReady(true);
    }
  }, [applyDevProfile, clearProfile]);

  useEffect(() => {
    loadNickname();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadNickname();
    });
    return () => listener.subscription.unsubscribe();
  }, [loadNickname]);

  const refreshNickname = useCallback(async () => {
    await loadNickname();
  }, [loadNickname]);

  const setNickname = useCallback(async (name: string) => {
    const trimmed = name.trim().slice(0, 16);
    if (isDevAuthEnabled() && isDevSignedIn()) {
      persistDevNickname(trimmed);
      setNicknameState(trimmed || getDevNickname() || "Alex");
      return;
    }
    setNicknameState(trimmed || "User");
  }, []);

  const signOut = useCallback(async () => {
    if (isDevAuthEnabled()) devSignOut();
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore: real session may not exist in dev mode
    }
    clearProfile();
  }, [clearProfile]);

  return (
    <UserContext.Provider
      value={{
        nickname,
        email,
        points,
        isReady,
        isLoggedIn,
        refreshNickname,
        setNickname,
        signOut,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
