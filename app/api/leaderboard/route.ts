import { overallScore } from "@/lib/scoring";
import { utcDate } from "@/lib/serverAuth";
import { createServiceClient } from "@/lib/supabaseClient";

const MIN_PLAYS = 3; // a user needs at least this many answered questions to be ranked
const LIMIT = 50;

function shift(iso: string, days: number): string {
  return new Date(Date.parse(iso) + days * 864e5).toISOString().slice(0, 10);
}

/** Current streak (days with a same-day play, ending today or yesterday, UTC). */
function streakOf(days: Set<string>): number {
  const today = utcDate();
  let cursor = days.has(today) ? today : shift(today, -1);
  let n = 0;
  while (days.has(cursor)) {
    n++;
    cursor = shift(cursor, -1);
  }
  return n;
}

/**
 * Ranking of signed-in players. Score = geometric mean of all their error
 * factors (lower is better); ties are broken by more questions played.
 */
export async function GET() {
  const db = createServiceClient();
  if (!db) return Response.json({ error: "Server neconfigurat." }, { status: 500 });

  const { data: plays, error } = await db
    .from("plays")
    .select("user_id, publish_date, position, factor, played_on")
    .not("user_id", "is", null)
    .limit(100000);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  type Agg = { factors: Map<string, number>; days: Set<string> };
  const users = new Map<string, Agg>();
  for (const p of plays ?? []) {
    const agg = users.get(p.user_id) ?? { factors: new Map(), days: new Set() };
    // same question played on several devices counts once
    agg.factors.set(`${p.publish_date}:${p.position}`, Number(p.factor));
    if (p.played_on === p.publish_date) agg.days.add(p.publish_date);
    users.set(p.user_id, agg);
  }

  const ranked = [...users.entries()]
    .filter(([, a]) => a.factors.size >= MIN_PLAYS)
    .map(([id, a]) => ({
      id,
      score: overallScore([...a.factors.values()]),
      played: a.factors.size,
      streak: streakOf(a.days),
    }))
    .sort((a, b) => a.score - b.score || b.played - a.played)
    .slice(0, LIMIT);

  const { data: profiles } = await db
    .from("profiles")
    .select("id, username")
    .in("id", ranked.map((r) => r.id));
  const names = new Map((profiles ?? []).map((p) => [p.id, p.username]));

  return Response.json({
    rows: ranked.map((r, i) => ({
      rank: i + 1,
      username: names.get(r.id) ?? "anonim",
      score: r.score,
      streak: r.streak,
      played: r.played,
    })),
  });
}
