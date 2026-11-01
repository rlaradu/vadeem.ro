import { isAdmin } from "@/lib/adminAuth";
import { createServiceClient } from "@/lib/supabaseClient";

const STATUSES = ["new", "used", "rejected"];

function setup(request: Request) {
  if (!isAdmin(request)) {
    return { error: Response.json({ error: "Neautorizat. Autentifică-te din nou." }, { status: 401 }) };
  }
  const db = createServiceClient();
  if (!db) {
    return { error: Response.json({ error: "Supabase nu este configurat." }, { status: 500 }) };
  }
  return { db };
}

/** List ideas, newest first. */
export async function GET(request: Request) {
  const s = setup(request);
  if (!s.db) return s.error;
  const { data, error } = await s.db
    .from("question_ideas")
    .select("id, idea_text, suggested_answer, source_link, contact, status, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ideas: data });
}

/** Change an idea's status (new / used / rejected). */
export async function PATCH(request: Request) {
  const s = setup(request);
  if (!s.db) return s.error;
  const body = await request.json().catch(() => ({}));
  if (!body.id || !STATUSES.includes(body.status)) {
    return Response.json({ error: "Cerere invalidă." }, { status: 400 });
  }
  const { error } = await s.db
    .from("question_ideas")
    .update({ status: body.status })
    .eq("id", body.id);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ ok: true });
}

/** Delete an idea. */
export async function DELETE(request: Request) {
  const s = setup(request);
  if (!s.db) return s.error;
  const body = await request.json().catch(() => ({}));
  if (!body.id) return Response.json({ error: "Cerere invalidă." }, { status: 400 });
  const { error } = await s.db.from("question_ideas").delete().eq("id", body.id);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ ok: true });
}
