"use client";

import { useState } from "react";
import { getClientId } from "@/lib/gameStorage";
import Icon from "./Icon";

const field =
  "w-full rounded-2xl border-2 border-transparent bg-black/20 px-4 py-3 font-mono outline-none transition-colors placeholder:text-white/45 focus:border-white/70";
const label =
  "block font-mono text-xs font-bold uppercase tracking-[0.2em] text-white/70";

/** Form for players to suggest a question. Sent to Supabase through /api/ideas. */
export default function IdeaForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: data.get("idea"),
          answer: data.get("answer"),
          source: data.get("source"),
          contact: data.get("contact"),
          website: data.get("website"), // honeypot
          clientId: getClientId(),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Nu am putut trimite ideea.");
      form.reset();
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare de rețea.");
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <div className="animate-pop rounded-3xl bg-black/20 p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white text-[var(--card)]">
          <Icon name="check" className="h-7 w-7" />
        </span>
        <p className="mt-4 text-2xl font-black tracking-tight">Mulțumim!</p>
        <p className="mt-2 text-white/80">
          Ideea ta a ajuns la noi. Dacă o folosim, o vei vedea într-o zi pe site.
        </p>
        <button onClick={() => setStatus("idle")} className="btn btn-card mt-6">
          Trimite încă una
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="idea" className={label}>
          Întrebarea ta
        </label>
        <textarea
          id="idea"
          name="idea"
          required
          minLength={15}
          maxLength={300}
          rows={3}
          placeholder="ex: Câte shaorme se vând într-o vineri în București?"
          className={`${field} mt-2`}
        />
      </div>
      <div>
        <label htmlFor="answer" className={label}>
          Răspunsul, dacă îl știi (opțional)
        </label>
        <input
          id="answer"
          name="answer"
          maxLength={100}
          placeholder="ex: aproximativ 150.000"
          className={`${field} mt-2`}
        />
      </div>
      <div>
        <label htmlFor="source" className={label}>
          Sursă / link (opțional)
        </label>
        <input
          id="source"
          name="source"
          maxLength={300}
          placeholder="https://..."
          className={`${field} mt-2`}
        />
      </div>
      <div>
        <label htmlFor="contact" className={label}>
          Nume sau email, ca să te menționăm (opțional)
        </label>
        <input
          id="contact"
          name="contact"
          maxLength={100}
          placeholder="ex: andrei sau andrei@exemplu.ro"
          className={`${field} mt-2`}
        />
      </div>

      {/* honeypot: hidden from people, bots tend to fill it */}
      <input
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      {error && (
        <p role="alert" className="font-bold">
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <button disabled={status === "sending"} className="btn btn-card">
          {status === "sending" ? "Se trimite…" : "Trimite ideea"}
          <Icon name="arrow" className="icon-nudge h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
