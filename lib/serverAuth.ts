import { createServiceClient } from "./supabaseClient";

/** Resolve the signed-in user from an `Authorization: Bearer <access token>` header. */
export async function getUserId(request: Request): Promise<string | null> {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const db = createServiceClient();
  if (!db) return null;
  const { data, error } = await db.auth.getUser(token);
  return error ? null : (data.user?.id ?? null);
}

/** YYYY-MM-DD in UTC. */
export function utcDate(offsetDays = 0): string {
  return new Date(Date.now() + offsetDays * 864e5).toISOString().slice(0, 10);
}
