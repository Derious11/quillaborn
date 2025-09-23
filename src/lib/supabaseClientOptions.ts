const COOKIE_NAME = "sb-qbn-auth-token";

export const supabaseCookieOptions = {
  name: COOKIE_NAME,
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 365, // 1 year
  domain: undefined,           // ✅ add this
} as const;

export const supabaseClientOptions = {
  auth: {
    storageKey: COOKIE_NAME,
  },
} as const;
