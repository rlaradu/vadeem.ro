import { JUDETE } from "@/lib/judet/data";
import { MAP_CENTERS, MAP_HEIGHT, MAP_PATHS, MAP_WIDTH } from "@/lib/judet/mapPaths";

/** Cum se colorează un județ: „aproape”, „departe”, ghicit corect („won”, verde) sau dezvăluit după pierdere („target”, roșu). */
export type MapState = "close" | "far" | "target" | "won";

// București se desenează ultimul, ca să rămână deasupra lui Ilfov (care îl înconjoară).
const DRAW_ORDER = [...JUDETE].sort(
  (a, b) => Number(a.code === "B") - Number(b.code === "B"),
);

/**
 * Harta României, doar pentru privit: arată ce județe ai încercat și cât de aproape
 * erau. NU se poate atinge și nu are nume la trecerea cursorului, altfel ar fi prea
 * ușor: județul trebuie știut, nu ales cu un clic. Culorile sunt în globals.css (`.map-county`).
 */
export default function RomaniaMap({
  states,
}: {
  /** Starea județelor deja ghicite, după cod. */
  states: Readonly<Record<string, MapState | undefined>>;
}) {
  const [bx, by] = MAP_CENTERS.B;

  return (
    <svg
      viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
      className="pointer-events-none block h-auto w-full select-none"
      // Informația de pe hartă există și ca text în lista de încercări.
      aria-hidden="true"
      focusable="false"
    >
      {DRAW_ORDER.map((j) => (
        <path
          key={j.code}
          d={MAP_PATHS[j.code]}
          fillRule="evenodd"
          className="map-county"
          data-state={states[j.code]}
        />
      ))}

      {/* Bucureștiul e mic pe hartă: când e încercat, îi punem un punct colorat. */}
      {states.B && <circle cx={bx} cy={by} r={13} className="map-pin" data-state={states.B} />}
    </svg>
  );
}
