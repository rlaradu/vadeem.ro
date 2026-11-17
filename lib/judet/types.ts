/** Regiunile istorice (tradiționale) ale României. */
export type Region =
  | "transilvania"
  | "banat"
  | "crisana"
  | "maramures"
  | "moldova"
  | "bucovina"
  | "muntenia"
  | "oltenia"
  | "dobrogea";

/** Un județ (sau municipiul București, tratat ca unitate de nivel județean). */
export interface Judet {
  /** Indicativul auto, unic: "CJ", "B" etc. */
  code: string;
  name: string;
  region: Region;
  /** Locuitori, recensământul din 2021. */
  population: number;
  areaKm2: number;
  /** Centrul geografic al județului (grade zecimale). */
  lat: number;
  lon: number;
  /** Reședința de județ (lipsește la București și Ilfov). */
  seat?: string;
  /** Codurile județelor cu care are graniță comună. */
  neighbors: readonly string[];
}

/** Cât de aproape e un indiciu: potrivire exactă / apropiat / departe. */
export type TileState = "correct" | "close" | "far";

/** Rezultatul comparării unei încercări cu județul căutat. */
export interface GuessResult {
  /** Județul ghicit. */
  code: string;
  /** Adevărat dacă ai nimerit județul căutat. */
  isCorrect: boolean;
  region: { state: TileState };
  population: {
    state: TileState;
    /** Unde se află județul căutat față de cel ghicit: "up" = are mai mulți locuitori. */
    direction: "up" | "down" | "none";
    /** Raportul dintre populația mai mare și cea mai mică (≥ 1). */
    ratio: number;
  };
  /** "correct" dacă județul ghicit se învecinează cu cel căutat. */
  neighbor: { state: TileState };
  distance: {
    state: TileState;
    km: number;
    /** 0–100, cât de aproape ești față de cea mai mare distanță posibilă. */
    proximity: number;
  };
}

export type GameStatus = "playing" | "won" | "lost";
