"use client";

import { useState } from "react";
import Icon from "./Icon";

/** Copiază un text în clipboard (de exemplu rezultatul de distribuit) și confirmă vizual. */
export default function CopyTextButton({
  text,
  label = "Copiază rezultatul",
  className = "btn btn-card",
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      setStatus("failed"); // clipboard blocat (de exemplu context nesecurizat)
    }
    setTimeout(() => setStatus("idle"), 2500);
  }

  return (
    <button type="button" onClick={handleCopy} className={className}>
      {status === "copied" ? (
        <>
          Copiat <Icon name="check" />
        </>
      ) : status === "failed" ? (
        "Nu s-a putut copia"
      ) : (
        label
      )}
    </button>
  );
}
