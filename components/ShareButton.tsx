"use client";

import { useState } from "react";
import {
  SHARE_SYMBOL,
  formatFactor,
  scoreFromFactor,
} from "@/lib/scoring";
import Icon from "./Icon";

/** Copies a compact result line to the clipboard, e.g. "vadeem.ro 1/11 · 9.68× ●◐○". */
export default function ShareButton({
  date,
  factors,
  score,
}: {
  date: string; // YYYY-MM-DD
  factors: number[]; // per-question error factors, ordered by position
  score: number; // overall score
}) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  async function handleShare() {
    const [, m, d] = date.split("-");
    const grid = factors.map((f) => SHARE_SYMBOL[scoreFromFactor(f)]).join("");
    const text = `vadeem.ro ${Number(d)}/${Number(m)} · ${formatFactor(score)} ${grid}`;
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      setStatus("failed"); // clipboard blocked (e.g. insecure context)
    }
    setTimeout(() => setStatus("idle"), 2500);
  }

  return (
    <button onClick={handleShare} className="btn btn-primary">
      {status === "copied" ? (
        <>
          Copiat <Icon name="check" />
        </>
      ) : status === "failed" ? (
        "Nu s-a putut copia"
      ) : (
        "Copiază rezultatul"
      )}
    </button>
  );
}
