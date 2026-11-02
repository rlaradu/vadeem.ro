import { errorFactor } from "@/lib/scoring";
import { getUserId, utcDate } from "@/lib/serverAuth";
import { createServiceClient } from "@/lib/supabaseClient";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

interface IncomingEntry {
  date: string;
  position: number;
  guess: number;
  playedOn: string;
}

/**
 * Store played questions for the community stats / leaderboard.
 * The client only sends its guess; the factor is recomputed here from the
 * real answer. If a valid access token is sent, the plays are linked to that user.
 */
export async function POST(request: Request) {
  const db = createServiceClient();
  if (!db) return Response.json({ error: "Server neconfigurat." }, { status: 500 });

  let body: { clientId?: string; entries?: IncomingEntry[] };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON invalid." }, { status: 400 });
  }
  
  const { clientId, entries } = body;
  if (!clientId || !UUID.test(clientId) || !Array.isArray(entries) || entries.length > 200) {
    return Response.json({ error: "Cerere invalidă." }, { status: 400 });
  }

  // Never accept plays for questions that aren't published yet (+1 day for timezones).
  const maxDate = utcDate(1);
  const valid = entries.filter(
    (e) =>
      DATE.test(e.date) &&
      e.date <= maxDate &&
      DATE.test(e.playedOn) &&
      [1, 2, 3].includes(e.position) &&
      Number.isFinite(e.guess) &&
      e.guess > 0,
  );
  
  if (valid.length === 0) return Response.json({ ok: true, saved: 0 });

  const dates = [...new Set(valid.map((e) => e.date))];
  const { data: questions, error: qErr } = await db
    .from("daily_questions")
    .select("publish_date, position, correct_answer")
    .in("publish_date", dates);
    
  if (qErr) return Response.json({ error: qErr.message }, { status: 500 });

  const answers = new Map(
    (questions ?? []).map((q) => [`${q.publish_date}:${q.position}`, Number(q.correct_answer)]),
  );
  
  const userId = await getUserId(request);

  const rows = valid.flatMap((e) => {
    const answer = answers.get(`${e.date}:${e.position}`);
    if (answer === undefined) return [];
    return [
      {
        client_id: clientId,
        publish_date: e.date,
        position: e.position,
        user_id: userId || null, // Fallback sigur la null dacă utilizatorul nu e logat
        guess: e.guess,
        factor: errorFactor(e.guess, answer),
        played_on: e.playedOn,
      },
    ];
  });
  
  if (rows.length === 0) return Response.json({ ok: true, saved: 0 });

  // Ținta de conflict se schimbă dinamic:
  // Dacă e logat, suprascrie baza de date după cont. Dacă e oaspete, suprascrie după browser.
  const conflictTarget = userId ? "user_id,publish_date,position" : "client_id,publish_date,position";

  const { error } = await db
  .from("plays")
  .upsert(rows, { 
    onConflict: conflictTarget,
    ignoreDuplicates: true // <-- AICI: Baza de date păstrează doar PRIMUL joc și le ignoră pe următoarele!
  });
    
  if (error) return Response.json({ error: error.message }, { status: 500 });
  
  return Response.json({ ok: true, saved: rows.length });
}