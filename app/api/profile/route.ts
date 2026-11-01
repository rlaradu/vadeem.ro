import { getUserId } from "@/lib/serverAuth";
import { createServiceClient } from "@/lib/supabaseClient";

/** Current user's profile (username). */
export async function GET(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return Response.json({ error: "Neautentificat." }, { status: 401 });
  const db = createServiceClient();
  if (!db) return Response.json({ error: "Server neconfigurat." }, { status: 500 });
  const { data } = await db.from("profiles").select("username").eq("id", userId).maybeSingle();
  return Response.json({ username: data?.username ?? null });
}

/** Create or change the username of the signed-in user. */
export async function POST(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return Response.json({ error: "Neautentificat." }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const username = String(body.username ?? "").trim();
  if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) {
    return Response.json(
      { error: "Numele trebuie să aibă 3–20 caractere: litere, cifre sau _." },
      { status: 400 },
    );
  }

  const db = createServiceClient();
  if (!db) return Response.json({ error: "Server neconfigurat." }, { status: 500 });
  const { error } = await db.from("profiles").upsert({ id: userId, username });
  if (error) {
    const msg = error.code === "23505" ? "Numele este deja luat." : error.message;
    return Response.json({ error: msg }, { status: 400 });
  }
  return Response.json({ ok: true, username });
}
