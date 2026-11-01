import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/**
 * Admin session: after a correct password the server sets an HttpOnly,
 * SameSite=Strict cookie holding "<expiry>.<HMAC signature>". The password is
 * never stored in the browser or sent again. Changing ADMIN_PASSWORD (or
 * ADMIN_SESSION_SECRET) invalidates every existing session.
 */

export const COOKIE_NAME = "vd_admin";
const SESSION_SECONDS = 2 * 60 * 60; // 2 hours

function secret(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return (
    process.env.ADMIN_SESSION_SECRET ||
    createHash("sha256").update(`vadeem-admin:${password}`).digest("hex")
  );
}

function sign(expiry: string, key: string): string {
  return createHmac("sha256", key).update(expiry).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Constant-time comparison with ADMIN_PASSWORD. */
export function passwordMatches(given: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  return Boolean(expected && given) && safeEqual(given, expected as string);
}

function cookieAttrs(maxAge: number): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure}`;
}

/** Set-Cookie value for a fresh session (null if ADMIN_PASSWORD isn't configured). */
export function createSessionCookie(): string | null {
  const key = secret();
  if (!key) return null;
  const expiry = String(Math.floor(Date.now() / 1000) + SESSION_SECONDS);
  return `${COOKIE_NAME}=${expiry}.${sign(expiry, key)}; ${cookieAttrs(SESSION_SECONDS)}`;
}

/** Set-Cookie value that deletes the session. */
export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; ${cookieAttrs(0)}`;
}

/**
 * True when the request carries a valid, unexpired admin session cookie.
 * For state-changing methods the Origin must also match the host (CSRF defence
 * on top of SameSite=Strict).
 */
export function isAdmin(request: Request): boolean {
  const key = secret();
  if (!key) return false;

  const raw = request.headers
    .get("cookie")
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_NAME}=`))
    ?.slice(COOKIE_NAME.length + 1);
  if (!raw) return false;

  const [expiry, signature] = raw.split(".");
  if (!expiry || !signature) return false;
  if (Number(expiry) < Date.now() / 1000) return false;
  if (!safeEqual(signature, sign(expiry, key))) return false;

  if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    const origin = request.headers.get("origin");
    if (origin) {
      try {
        if (new URL(origin).host !== request.headers.get("host")) return false;
      } catch {
        return false;
      }
    }
  }
  return true;
}
