import { BUCKETS, bucketOf, overallScore } from "@/lib/scoring";
import { createServiceClient } from "@/lib/supabaseClient";

/**
 * Community distribution of daily scores for one date.
 * Only players who answered every question of the day are counted.
 * Optional `clientId` is excluded so the browser can add its own score locally
 * (this avoids racing with the upload of the player's own result).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date") ?? "";
  const clientId = url.searchParams.get("clientId");
  const mine = Number(url.searchParams.get("score"));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: "Dată invalidă." }, { status: 400 });
  }

  const db = createServiceClient();
  if (!db) return Response.json({ error: "Server neconfigurat." }, { status: 500 });

  const [{ count: questionCount }, { data, error }] = await Promise.all([
    db
      .from("daily_questions")
      .select("id", { count: "exact", head: true })
      .eq("publish_date", date),
    db
      .from("plays")
      .select("client_id, factor")
      .eq("publish_date", date)
      .limit(50000),
  ]);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const byClient = new Map<string, number[]>();
  for (const p of data ?? []) {
    if (p.client_id === clientId) continue;
    const list = byClient.get(p.client_id) ?? [];
    list.push(Number(p.factor));
    byClient.set(p.client_id, list);
  }

  const buckets = new Array<number>(BUCKETS).fill(0);
  let total = 0;
  let better = 0; // other players with a strictly better (lower) score than `mine`
  for (const factors of byClient.values()) {
    if (factors.length < (questionCount ?? 3)) continue; // unfinished day
    const s = overallScore(factors);
    buckets[bucketOf(s)]++;
    total++;
    if (Number.isFinite(mine) && s < mine) better++;
  }
  return Response.json({ buckets, total, better });
}
