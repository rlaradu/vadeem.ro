import { createServiceClient } from "@/lib/supabaseClient";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_PER_HOUR = 5; // per browser, to keep spam down

const clean = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

/** Save a question idea sent by a player. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "Cerere invalidă." }, { status: 400 });

  // Honeypot: real users never fill this hidden field; bots usually do.
  if (body.website) return Response.json({ ok: true });

  const idea_text = clean(body.idea, 300);
  const suggested_answer = clean(body.answer, 100) || null;
  const source_link = clean(body.source, 300) || null;
  const contact = clean(body.contact, 100) || null;
  const clientId = String(body.clientId ?? "");

  if (idea_text.length < 15) {
    return Response.json(
      { error: "Descrie întrebarea în cel puțin 15 caractere." },
      { status: 400 },
    );
  }
  if (!UUID.test(clientId)) {
    return Response.json({ error: "Cerere invalidă." }, { status: 400 });
  }

  const db = createServiceClient();
  if (!db) return Response.json({ error: "Serverul nu este configurat." }, { status: 500 });

  const since = new Date(Date.now() - 3600_000).toISOString();
  const { count } = await db
    .from("question_ideas")
    .select("id", { count: "exact", head: true })
    .eq("client_id", clientId)
    .gte("created_at", since);
  if ((count ?? 0) >= MAX_PER_HOUR) {
    return Response.json(
      { error: "Ai trimis multe idei într-o oră. Încearcă mai târziu." },
      { status: 429 },
    );
  }

  const { error } = await db.from("question_ideas").insert({
    idea_text,
    suggested_answer,
    source_link,
    contact,
    client_id: clientId,
  });
  if (error) return Response.json({ error: "Nu am putut salva ideea." }, { status: 500 });
  return Response.json({ ok: true });
}
