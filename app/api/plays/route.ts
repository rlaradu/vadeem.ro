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
 * The signed-in user's saved plays (one per date+position), so any device can
 * restore the progress after logging in.
 */
export async function GET(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return Response.json({ error: "Neautentificat." }, { status: 401 });
  const db = createServiceClient();
  if (!db) return Response.json({ error: "Server neconfigurat." }, { status: 500 });

  const { data, error } = await db
    .from("plays")
    .select("publish_date, position, guess, factor, played_on")
    .eq("user_id", userId)
    .order("created_at", { ascending: true }) // the first play of a question wins
    .limit(5000);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const byKey = new Map<string, { date: string; position: number; guess: number; factor: number; playedOn: string }>();
  for (const p of data ?? []) {
    const key = `${p.publish_date}:${p.position}`;
    if (!byKey.has(key)) {
      byKey.set(key, {
        date: p.publish_date,
        position: p.position,
        guess: Number(p.guess),
        factor: Number(p.factor),
        playedOn: p.played_on,
      });
    }
  }
  return Response.json({ plays: [...byKey.values()] });
}

/**
 * Store played questions for the community stats / leaderboard.
 * The client only sends its guess; the factor is recomputed here from the
 * real answer. If a valid access token is sent, the plays are linked to that
 * user, and a question the account already answered keeps its first answer
 * (the account wins over what this browser did locally).
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

  // Questions this account already answered from another browser: keep those.
  const takenByOtherDevice = new Set<string>();
  if (userId) {
    const { data: existing } = await db
      .from("plays")
      .select("publish_date, position, client_id")
      .eq("user_id", userId)
      .in("publish_date", dates);
    for (const p of existing ?? []) {
      if (p.client_id !== clientId) takenByOtherDevice.add(`${p.publish_date}:${p.position}`);
    }
  }

  const rows = valid.flatMap((e) => {
    const key = `${e.date}:${e.position}`;
    const answer = answers.get(key);
    if (answer === undefined || takenByOtherDevice.has(key)) return [];
    return [
      {
        client_id: clientId,
        publish_date: e.date,
        position: e.position,
        user_id: userId,
        guess: e.guess,
        factor: errorFactor(e.guess, answer),
        played_on: e.playedOn,
      },
    ];
  });
  if (rows.length === 0) return Response.json({ ok: true, saved: 0 });

  // Conflict on the real primary key. Signed in: overwrite so rows previously
  // stored anonymously by this browser get linked to the account. Guest: keep
  // the first answer.
  const { error } = await db.from("plays").upsert(rows, {
    onConflict: "client_id,publish_date,position",
    ignoreDuplicates: !userId,
  });
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true, saved: rows.length });
}
