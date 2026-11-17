import type { Judet } from "./types";

type Point = Pick<Judet, "lat" | "lon">;

const EARTH_RADIUS_KM = 6371.0088;
const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

/** Distanța pe sferă dintre două puncte, în km (formula Haversine). */
export function haversineKm(a: Point, b: Point): number {
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Direcția inițială de la `from` spre `to`, în grade față de nord (0 = nord, 90 = est). */
export function bearingDeg(from: Point, to: Point): number {
  const phi1 = toRad(from.lat);
  const phi2 = toRad(to.lat);
  const dLon = toRad(to.lon - from.lon);
  const y = Math.sin(dLon) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLon);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}
