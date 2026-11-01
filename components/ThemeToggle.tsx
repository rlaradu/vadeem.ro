"use client";

import Icon from "./Icon";

/**
 * Light/dark switch. Both icons are always rendered and shown via the `dark`
 * class on <html>, so no state is needed and there is no hydration flash.
 */
export default function ThemeToggle() {
  function toggle() {
    const isDark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("theme", isDark ? "dark" : "light");
    } catch {
      /* storage blocked: theme just won't persist */
    }
  }

  return (
    <button
      onClick={toggle}
      className="btn-icon"
      aria-label="Schimbă tema (luminos / întunecat)"
      title="Schimbă tema"
    >
      <Icon name="moon" className="h-[18px] w-[18px] dark:hidden" />
      <Icon name="sun" className="hidden h-[18px] w-[18px] dark:block" />
    </button>
  );
}
