"use client";

import { useSyncExternalStore } from "react";

/**
 * Cookie / storage consent.
 *  - "necessary": only what the site needs to work (game progress, theme, login).
 *  - "all": also privacy-friendly statistics (Vercel Web Analytics).
 *  - "unset": the visitor hasn't chosen yet -> the banner is shown.
 *  - "pending": server render / first paint, nothing is shown yet.
 */
export type Consent = "pending" | "unset" | "necessary" | "all";

const KEY = "consent:v1";
const listeners = new Set<() => void>();

function read(): Consent {
  try {
    const v = localStorage.getItem(KEY);
    return v === "all" || v === "necessary" ? v : "unset";
  } catch {
    return "unset"; // storage blocked: ask every time, never enable analytics
  }
}

function notify() {
  listeners.forEach((l) => l());
}

export function setConsent(value: "necessary" | "all") {
  try {
    localStorage.setItem(KEY, value);
  } catch {
    /* ignore */
  }
  notify();
}

/** Forget the choice so the banner shows again ("Setări cookie" link). */
export function resetConsent() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  notify();
}

export function useConsent(): Consent {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      window.addEventListener("storage", cb);
      return () => {
        listeners.delete(cb);
        window.removeEventListener("storage", cb);
      };
    },
    read,
    () => "pending",
  );
}
