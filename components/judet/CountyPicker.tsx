"use client";

import { useId, useState } from "react";
import { findByName, searchJudete } from "@/lib/judet/lookup";
import type { Judet } from "@/lib/judet/types";

/**
 * Câmp de căutare cu sugestii pentru alegerea unui județ. Diacriticele sunt opționale
 * („dambovita” găsește Dâmbovița), iar indicativul auto (CJ, B) merge și el.
 * Județul se scrie, nu se alege de pe hartă: harta e doar pentru privit.
 * Valoarea câmpului e ținută de părinte; mesajele de eroare le arată lista de încercări.
 */
export default function CountyPicker({
  text,
  onTextChange,
  onSubmit,
  excluded,
  disabled = false,
}: {
  text: string;
  onTextChange: (text: string) => void;
  onSubmit: () => void;
  /** Codurile județelor deja încercate (nu se mai sugerează). */
  excluded: ReadonlySet<string>;
  disabled?: boolean;
}) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);

  // Când textul e deja numele exact al unui județ, nu mai arătăm sugestii.
  const suggestions: Judet[] =
    open && text.trim() && !findByName(text) ? searchJudete(text, excluded) : [];

  function choose(judet: Judet) {
    onTextChange(judet.name);
    setOpen(false);
    setHighlight(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Enter" && suggestions.length > 0) {
      // Prima apăsare alege sugestia (cea evidențiată sau prima); a doua trimite încercarea.
      e.preventDefault();
      choose(suggestions[Math.max(highlight, 0)]);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setOpen(false);
        onSubmit();
      }}
      noValidate
      className="flex items-stretch gap-2"
    >
      <label htmlFor={`${listId}-input`} className="sr-only">
        Alege un județ
      </label>

      <div className="relative min-w-0 flex-1">
        <div className="flex h-11 items-center gap-2.5 rounded-2xl bg-black/20 px-4 transition-colors focus-within:bg-black/30 sm:gap-3">
          <span aria-hidden="true" className="select-none font-mono text-xl font-bold text-white/60">
            &gt;
          </span>
          <input
            id={`${listId}-input`}
            type="text"
            role="combobox"
            aria-expanded={suggestions.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={highlight >= 0 ? `${listId}-${highlight}` : undefined}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
            disabled={disabled}
            value={text}
            onChange={(e) => {
              onTextChange(e.target.value);
              setOpen(true);
              setHighlight(-1);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            onKeyDown={handleKeyDown}
            placeholder="caută un județ"
            className="h-full min-w-0 flex-1 bg-transparent font-mono text-base font-bold outline-none placeholder:font-normal placeholder:text-white/50 sm:text-lg"
          />
        </div>

        {suggestions.length > 0 && (
          <ul
            id={listId}
            role="listbox"
            // Înălțimea e limitată după ecran: lista nu trebuie să împingă pagina în jos.
            className="absolute inset-x-0 top-full z-20 mt-1.5 max-h-[min(15rem,32dvh)] overflow-auto rounded-2xl bg-[#f6f3ec] p-1 text-[#1f1814] shadow-2xl"
          >
            {suggestions.map((j, i) => (
              <li
                key={j.code}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === highlight}
                // mousedown nu mută focusul din câmp, deci clicul ajunge la `choose`.
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(j)}
                className={`flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 font-mono text-sm font-bold ${
                  i === highlight ? "bg-[var(--card)] text-white" : "hover:bg-black/5"
                }`}
              >
                <span>{j.name}</span>
                <span className="text-xs opacity-60">{j.code}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="btn btn-card h-11 shrink-0 !px-4 !py-0 sm:!px-7"
      >
        Ghicește
      </button>
    </form>
  );
}
