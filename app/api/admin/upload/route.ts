import { isAdmin } from "@/lib/adminAuth";
import { createServiceClient } from "@/lib/supabaseClient";

const BUCKET = "question-images";
const MAX_BYTES = 4 * 1024 * 1024; // stays under common serverless body limits
const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

/** Upload a question image to Supabase Storage and return its public URL. */
export async function POST(request: Request) {
  if (!isAdmin(request)) {
    return Response.json({ error: "Neautorizat. Autentifică-te din nou." }, { status: 401 });
  }
  const db = createServiceClient();
  if (!db) return Response.json({ error: "Supabase nu este configurat." }, { status: 500 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Alege o imagine." }, { status: 400 });
  }
  const ext = TYPES[file.type];
  if (!ext) {
    return Response.json({ error: "Format acceptat: JPG, PNG, WebP sau GIF." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "Imaginea e prea mare (maxim 4 MB)." }, { status: 400 });
  }

  // Create the public bucket on first use (no-op error if it already exists).
  await db.storage.createBucket(BUCKET, { public: true }).catch(() => {});

  const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`;
  const { error } = await db.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
  });
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const { data } = db.storage.from(BUCKET).getPublicUrl(path);
  return Response.json({ url: data.publicUrl });
}
