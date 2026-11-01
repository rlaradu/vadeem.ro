import {
  clearSessionCookie,
  createSessionCookie,
  isAdmin,
  passwordMatches,
} from "@/lib/adminAuth";

// Brute-force protection: 5 wrong passwords per IP per 15 minutes.
// Kept in memory, so on serverless hosts it is per instance (best effort).
const MAX_FAILS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const fails = new Map<string, { count: number; resetAt: number }>();

function clientKey(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
}

/** Is there a valid admin session? */
export async function GET(request: Request) {
  return Response.json({ authenticated: isAdmin(request) });
}

/** Log in: check the password and set the session cookie. */
export async function POST(request: Request) {
  if (!process.env.ADMIN_PASSWORD) {
    return Response.json({ error: "ADMIN_PASSWORD nu este setat." }, { status: 500 });
  }

  const key = clientKey(request);
  const now = Date.now();
  const entry = fails.get(key);
  if (entry && entry.resetAt > now && entry.count >= MAX_FAILS) {
    const minutes = Math.ceil((entry.resetAt - now) / 60000);
    return Response.json(
      { error: `Prea multe încercări. Mai așteaptă ${minutes} min.` },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => ({}));
  if (!passwordMatches(String(body.password ?? ""))) {
    const current = entry && entry.resetAt > now ? entry : { count: 0, resetAt: now + WINDOW_MS };
    current.count++;
    fails.set(key, current);
    await new Promise((r) => setTimeout(r, 500)); // slow down guessing
    return Response.json({ error: "Parolă greșită." }, { status: 401 });
  }

  fails.delete(key);
  const cookie = createSessionCookie();
  if (!cookie) return Response.json({ error: "Server neconfigurat." }, { status: 500 });
  return Response.json({ ok: true }, { headers: { "Set-Cookie": cookie } });
}

/** Log out: delete the session cookie. */
export async function DELETE() {
  return Response.json({ ok: true }, { headers: { "Set-Cookie": clearSessionCookie() } });
}
