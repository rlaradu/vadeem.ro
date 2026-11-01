"use client";

import { useEffect, useState } from "react";
import QuestionCard from "@/components/QuestionCard";
import QuestionImage from "@/components/QuestionImage";
import { parseGuess } from "@/lib/scoring";

const field =
  "w-full rounded-2xl border-2 border-transparent bg-black/20 px-4 py-3 font-mono text-sm outline-none transition-colors placeholder:text-white/45 focus:border-white/70";

interface Item {
  id: string;
  publish_date: string;
  position: number;
  question_text: string;
  image_url: string | null;
}

interface Idea {
  id: string;
  idea_text: string;
  suggested_answer: string | null;
  source_link: string | null;
  contact: string | null;
  status: "new" | "used" | "rejected";
  created_at: string;
}

type Msg = { ok: boolean; text: string } | null;

/** Hidden admin page (not linked anywhere). Password is checked server-side. */
export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [loginPassword, setLoginPassword] = useState("");
  const [msg, setMsg] = useState<Msg>(null);
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState<Item[] | null>(null);
  const [ideas, setIdeas] = useState<Idea[] | null>(null);

  // Is there already a valid session cookie?
  useEffect(() => {
    fetch("/api/admin/login")
      .then((r) => r.json())
      .then((d) => setAuthed(Boolean(d.authenticated)))
      .catch(() => setAuthed(false));
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: loginPassword }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setLoginPassword("");
        setAuthed(true);
      } else {
        setMsg({ ok: false, text: json.error ?? "Autentificare eșuată." });
      }
    } catch {
      setMsg({ ok: false, text: "Eroare de rețea." });
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    setAuthed(false);
    setItems(null);
    setIdeas(null);
    setMsg(null);
  }

  /** Upload a file and return its public URL (throws with a readable message). */
  async function upload(file: File): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Încărcarea a eșuat.");
    return json.url;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const answer = parseGuess(String(data.get("correct_answer")));
    if (answer === null || !Number.isInteger(answer)) {
      setMsg({ ok: false, text: "Răspunsul trebuie să fie un număr întreg pozitiv." });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const file = data.get("image");
      const link = String(data.get("image_link") ?? "").trim();
      const image_url =
        file instanceof File && file.size > 0 ? await upload(file) : link || null;
      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publish_date: data.get("publish_date"),
          position: Number(data.get("position")),
          question_text: data.get("question_text"),
          correct_answer: answer,
          explanation_text: data.get("explanation_text"),
          source_link: data.get("source_link"),
          image_url,
          unit: data.get("unit"),
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setMsg({ ok: true, text: "Întrebare adăugată ✓" });
        form.reset();
        if (items) void loadItems();
      } else {
        setMsg({ ok: false, text: json.error ?? "Eroare necunoscută." });
      }
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Eroare de rețea." });
    } finally {
      setBusy(false);
    }
  }

  async function loadItems() {
    setMsg(null);
    const res = await fetch("/api/admin/questions");
    const json = await res.json().catch(() => ({}));
    if (res.ok) setItems(json.questions);
    else setMsg({ ok: false, text: json.error ?? "Nu am putut încărca întrebările." });
  }

  async function setImage(item: Item, file: File | null) {
    setMsg(null);
    try {
      const image_url = file ? await upload(file) : null;
      const res = await fetch("/api/admin/questions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, image_url }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Eroare.");
      setItems((prev) => prev?.map((i) => (i.id === item.id ? { ...i, image_url } : i)) ?? null);
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Eroare de rețea." });
    }
  }

  async function loadIdeas() {
    setMsg(null);
    const res = await fetch("/api/admin/ideas");
    const json = await res.json().catch(() => ({}));
    if (res.ok) setIdeas(json.ideas);
    else setMsg({ ok: false, text: json.error ?? "Nu am putut încărca ideile." });
  }

  async function setIdeaStatus(id: string, status: Idea["status"]) {
    const res = await fetch("/api/admin/ideas", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) setIdeas((p) => p?.map((i) => (i.id === id ? { ...i, status } : i)) ?? null);
  }

  async function deleteIdea(id: string) {
    const res = await fetch("/api/admin/ideas", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) setIdeas((p) => p?.filter((i) => i.id !== id) ?? null);
  }

  if (authed === null) {
    return (
      <QuestionCard headerRight="~/admin">
        <p className="py-10 text-center font-mono text-sm uppercase tracking-widest text-white/70">
          Se verifică sesiunea…
        </p>
      </QuestionCard>
    );
  }

  if (!authed) {
    return (
      <QuestionCard headerRight="~/admin">
        <form onSubmit={login} className="space-y-4">
          <h1 className="text-4xl font-black tracking-tight">Admin</h1>
          <input
            type="password"
            autoComplete="current-password"
            autoFocus
            required
            placeholder="Parolă"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            className={field}
          />
          <button disabled={busy} className="btn btn-card w-full">
            {busy ? "Se verifică…" : "Autentificare"}
          </button>
          {msg && (
            <p role="alert" className="font-bold">
              {msg.text}
            </p>
          )}
        </form>
      </QuestionCard>
    );
  }

  return (
    <QuestionCard headerRight="~/admin">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-4xl font-black tracking-tight">Admin</h1>
        <button onClick={logout} className="btn btn-ghost !py-2.5">
          Deconectare
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-white/80">
          {"// întrebare nouă"}
        </h2>
        <div className="flex gap-4">
          <input type="date" name="publish_date" required className={field} />
          <select name="position" defaultValue="1" className={`${field} w-40`}>
            <option value="1">Q1</option>
            <option value="2">Q2</option>
            <option value="3">Q3</option>
          </select>
        </div>
        <textarea name="question_text" placeholder="Întrebarea" required rows={2} className={field} />
        <input name="correct_answer" placeholder="Răspuns corect (număr întreg)" required className={field} />
        <input name="unit" placeholder="Unitate de măsură (ex: KILOGRAME, BUCĂȚI, LEI)" maxLength={30} className={field} />
        <textarea name="explanation_text" placeholder="Explicație" required rows={3} className={field} />
        <input type="url" name="source_link" placeholder="Link sursă (opțional)" className={field} />
        <label className="block text-sm text-muted">
          Imagine (opțional, JPG/PNG/WebP/GIF, max 4 MB). Fără imagine se folosește una generată.
          <input
            type="file"
            name="image"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className={`${field} mt-2 file:mr-4 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-1.5 file:text-xs file:font-bold file:text-accent-fg`}
          />
        </label>
        <input type="url" name="image_link" placeholder="...sau lipește un link către o imagine (opțional)" className={field} />
        <button disabled={busy} className="btn btn-card w-full">
          {busy ? "Se salvează…" : "Adaugă întrebarea"}
        </button>
      </form>

      {msg && (
        <p role="alert" className={`mt-4 font-semibold ${msg.ok ? "text-good" : "text-bad"}`}>
          {msg.text}
        </p>
      )}

      <section className="mt-12">
        <h2 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-white/80">
          {"// imagini pentru întrebările existente"}
        </h2>
        <button onClick={loadItems} className="btn btn-ghost mt-4">
          {items ? "Reîncarcă lista" : "Încarcă întrebările"}
        </button>
        <ul className="mt-6 space-y-3">
          {items?.map((it) => (
            <li key={it.id} className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-3">
              <QuestionImage
                src={it.image_url}
                seed={it.id + it.question_text}
                alt=""
                className="h-16 w-24 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="font-mono text-xs text-muted">
                  {it.publish_date} · Q{it.position}
                </p>
                <p className="truncate text-sm font-bold">{it.question_text}</p>
                <div className="mt-2 flex items-center gap-3">
                  <label className="link-anim cursor-pointer text-xs font-bold">
                    {it.image_url ? "Schimbă imaginea" : "Adaugă imagine"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void setImage(it, f);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {it.image_url && (
                    <button onClick={() => setImage(it, null)} className="link-anim text-xs font-bold text-bad">
                      Șterge
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-12">
        <h2 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-white/80">
          {"// idei trimise de jucători"}
        </h2>
        <button onClick={loadIdeas} className="btn btn-ghost mt-4">
          {ideas ? "Reîncarcă ideile" : "Încarcă ideile"}
        </button>
        {ideas && ideas.length === 0 && (
          <p className="mt-4 text-white/70">Nicio idee încă.</p>
        )}
        <ul className="mt-6 space-y-3">
          {ideas?.map((i) => (
            <li
              key={i.id}
              className={`rounded-2xl bg-black/20 p-4 ${i.status !== "new" ? "opacity-60" : ""}`}
            >
              <p className="font-bold leading-snug">{i.idea_text}</p>
              <p className="mt-2 font-mono text-xs text-white/70">
                {new Date(i.created_at).toLocaleString("ro-RO")}
                {i.contact && ` · ${i.contact}`}
                {i.suggested_answer && ` · răspuns: ${i.suggested_answer}`}
              </p>
              {i.source_link && (
                <a
                  href={i.source_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-anim mt-1 inline-block break-all font-mono text-xs"
                >
                  {i.source_link}
                </a>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-4 font-mono text-xs font-bold uppercase tracking-widest">
                <span className="text-white/60">
                  {i.status === "new" ? "nouă" : i.status === "used" ? "folosită" : "respinsă"}
                </span>
                <button onClick={() => setIdeaStatus(i.id, "used")} className="link-anim">
                  Folosită
                </button>
                <button onClick={() => setIdeaStatus(i.id, "rejected")} className="link-anim">
                  Respinsă
                </button>
                <button onClick={() => deleteIdea(i.id)} className="link-anim">
                  Șterge
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </QuestionCard>
  );
}
