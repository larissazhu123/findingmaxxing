// Dev-only fake auth. Gated by NEXT_PUBLIC_DEV_USER_NICKNAME in .env.
// When enabled, the app simulates a signed-in user without ever touching
// Supabase, so login / settings / logout flows can be exercised offline.
// Nothing persists to the database — all state lives in localStorage.

const ENV_NICKNAME = process.env.NEXT_PUBLIC_DEV_USER_NICKNAME?.trim() || "";

const STATE_KEY = "findingmaxxing.devAuthState"; // "in" | "out"
const NICKNAME_KEY = "findingmaxxing.devNickname";

export const DEV_USER_PROFILE = {
  email: "ashick@umass.edu",
  points: 42,
  joinDate: "September 2024",
  itemsReported: 12,
  itemsReturned: 8,
};

export function isDevAuthEnabled(): boolean {
  return ENV_NICKNAME.length > 0;
}

export function getDevEnvNickname(): string {
  return ENV_NICKNAME;
}

// Default state when no value is stored: treat the user as signed in,
// so a fresh load with the env var set shows the dev user immediately.
export function isDevSignedIn(): boolean {
  if (!isDevAuthEnabled()) return false;
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(STATE_KEY) !== "out";
}

export function devSignIn(): void {
  if (!isDevAuthEnabled() || typeof window === "undefined") return;
  window.localStorage.setItem(STATE_KEY, "in");
}

export function devSignOut(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STATE_KEY, "out");
}

export function getDevNickname(): string {
  if (typeof window === "undefined") return ENV_NICKNAME;
  return window.localStorage.getItem(NICKNAME_KEY) || ENV_NICKNAME;
}

export function setDevNickname(name: string): void {
  if (typeof window === "undefined") return;
  const trimmed = name.trim();
  if (trimmed) window.localStorage.setItem(NICKNAME_KEY, trimmed);
  else window.localStorage.removeItem(NICKNAME_KEY);
}
