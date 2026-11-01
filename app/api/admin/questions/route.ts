import { isAdmin } from "@/lib/adminAuth";
import { createServiceClient } from "@/lib/supabaseClient";

function httpUrlOrNull(v: unknown): string | null {
  const s = String(v ?? "").trim();
  return /^https?:\/\//i.test(s) ? s : null;
}

/** List recent questions (newest first) so images can be added to existing ones. */
export async function GET(request: Request) {
  if (!isAdmin(request)) {
    return Response.json({ error: "Neautorizat. Autentifică-te din nou." }, { status: 401 });
  }
  const db = createServiceClient();
  if (!db) return Response.json({ error: "Supabase nu este configurat." }, { status: 500 });

  const { data, error } = await db
    .from("daily_questions")
    .select("id, publish_date, position, question_text, image_url")
    .order("publish_date", { ascending: false })
    .order("position")
    .limit(120);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ questions: data });
}

/** Insert a daily question. Protected by the ADMIN_PASSWORD env variable. */
export async function POST(request: Request) {
  if (!process.env.ADMIN_PASSWORD) {
    return Response.json({ error: "ADMIN_PASSWORD nu este setat." }, { status: 500 });
  }
  if (!isAdmin(request)) {
    return Response.json({ error: "Neautorizat. Autentifică-te din nou." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON invalid." }, { status: 400 });
  }

  const publish_date = String(body.publish_date ?? "");
  const question_text = String(body.question_text ?? "").trim();
  const explanation_text = String(body.explanation_text ?? "").trim();
  const source_link = String(body.source_link ?? "").trim() || null;
  const image_url = httpUrlOrNull(body.image_url);
  const unit = String(body.unit ?? "").trim().slice(0, 30).toUpperCase() || null;
  const correct_answer = Number(body.correct_answer);
  const position = Number(body.position);

  if (![1, 2, 3].includes(position)) {
    return Response.json({ error: "Poziția trebuie să fie 1, 2 sau 3." }, { status: 400 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(publish_date) || !question_text || !explanation_text) {
    return Response.json({ error: "Completează data, întrebarea și explicația." }, { status: 400 });
  }
  if (!Number.isSafeInteger(correct_answer)) {
    return Response.json({ error: "Răspunsul trebuie să fie un număr întreg." }, { status: 400 });
  }

  const db = createServiceClient();
  if (!db) {
    return Response.json({ error: "Supabase nu este configurat (lipsește SUPABASE_SERVICE_ROLE_KEY)." }, { status: 500 });
  }

  const { error } = await db.from("daily_questions").insert({
    publish_date,
    position,
    question_text,
    correct_answer,
    explanation_text,
    source_link,
    image_url,
    unit,
  });
  if (error) {
    const msg =
      error.code === "23505"
        ? "Există deja o întrebare pe poziția asta, la data aceea."
        : error.message;
    return Response.json({ error: msg }, { status: 400 });
  }
  return Response.json({ ok: true });
}

/** Set or clear the image of an existing question. */
export async function PATCH(request: Request) {
  if (!isAdmin(request)) {
    return Response.json({ error: "Neautorizat. Autentifică-te din nou." }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const id = String(body.id ?? "");
  if (!id) return Response.json({ error: "Lipsește id." }, { status: 400 });

  const db = createServiceClient();
  if (!db) return Response.json({ error: "Supabase nu este configurat." }, { status: 500 });
  const { error } = await db
    .from("daily_questions")
    .update({ image_url: httpUrlOrNull(body.image_url) })
    .eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ ok: true });
}
