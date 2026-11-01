"use client";

import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { getHistory } from "@/lib/gameStorage";
import { syncHistory } from "@/lib/cloudSync";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";

const input =
  "w-full rounded-2xl border-2 border-transparent bg-black/20 px-4 py-3 font-mono outline-none transition-colors placeholder:text-white/45 focus:border-white/70";
const button =
  "btn btn-card w-full";

type Msg = { ok: boolean; text: string } | null;

/** Optional account: email magic link sign-in, username, and cloud sync. */
export default function AccountPanel() {
  const [session, setSession] = useState<Session | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [currentName, setCurrentName] = useState<string | null>(null);
  const [msg, setMsg] = useState<Msg>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoaded(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  // Load the username once signed in.
  const token = session?.access_token;
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    fetch("/api/profile", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled || !d) return;
        setCurrentName(d.username);
        if (d.username) setUsername(d.username);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!isSupabaseConfigured || !supabase) {
    return <p className="text-muted">Conturile nu sunt disponibile (baza de date nu e configurată).</p>;
  }
  if (!loaded) return <p className="font-bold">Se încarcă…</p>;

  const client = supabase;

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const { error } = await client.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/account` },
    });
    setBusy(false);
    setMsg(
      error
        ? { ok: false, text: error.message }
        : { ok: true, text: "Ți-am trimis un link pe email. Deschide-l pe acest dispozitiv." },
    );
  }

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ username }),
      });
      const d = await res.json();
      if (res.ok) {
        setCurrentName(d.username);
        setMsg({ ok: true, text: "Salvat ✓" });
        await syncHistory(getHistory()); // make sure plays are linked to the account
      } else {
        setMsg({ ok: false, text: d.error ?? "Eroare." });
      }
    } catch {
      setMsg({ ok: false, text: "Eroare de rețea." });
    } finally {
      setBusy(false);
    }
  }

  const msgEl = msg && (
    <p role="alert" className={`mt-4 font-semibold ${msg.ok ? "text-good" : "text-bad"}`}>
      {msg.text}
    </p>
  );

  if (!session) {
    return (
      <form onSubmit={signIn} className="space-y-4">
        <p className="text-muted">
          Contul este opțional. Cu cont, progresul se salvează în cloud și apari
          în clasament. Fără cont, jocul funcționează la fel, cu datele în browser.
        </p>
        <input
          type="email"
          required
          placeholder="email@exemplu.ro"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={input}
        />
        <button disabled={busy} className={button}>
          {busy ? "Se trimite…" : "TRIMITE LINK DE AUTENTIFICARE"}
        </button>
        {msgEl}
      </form>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-muted">
        Autentificat ca <b className="text-fg">{session.user.email}</b>
      </p>
      <form onSubmit={saveName} className="space-y-4">
        <label className="block text-xs font-bold uppercase tracking-widest text-muted">
          Nume în clasament
        </label>
        <input
          required
          placeholder="ex: fermi_fan"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={input}
        />
        <button disabled={busy} className={button}>
          {currentName ? "SCHIMBĂ NUMELE" : "SALVEAZĂ NUMELE"}
        </button>
        {msgEl}
      </form>
      <button
        onClick={() => client.auth.signOut()}
        className="font-mono text-xs uppercase tracking-widest text-muted underline"
      >
        Deconectare
      </button>
    </div>
  );
}
