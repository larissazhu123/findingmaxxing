// Legacy import path. Re-exports the canonical helper from `@/lib/googleAuthFetch`
// so any code still importing `@/pages/api/user/googleAuthFetch` keeps working.
export { handleGoogleSignIn } from "@/lib/googleAuthFetch";
