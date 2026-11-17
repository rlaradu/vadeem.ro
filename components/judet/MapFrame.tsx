import Polaroid from "../Polaroid";
import RomaniaMap, { type MapState } from "./RomaniaMap";

/**
 * Harta într-un „polaroid” înclinat în partea opusă pozei de la „Estimarea zilei”:
 * același obiect, folosit altfel. Pe jos, ca pe o poză adevărată, e scrisă o mică legendă.
 */
export default function MapFrame({
  states,
  caption,
}: {
  states: Readonly<Record<string, MapState | undefined>>;
  caption: string;
}) {
  return (
    <Polaroid
      tilt={-3}
      caption={caption}
      className="map-frame w-[var(--polaroid-w)] shrink-0 md:mx-auto md:w-full md:max-w-[19rem]"
    >
      <div className="bg-[#f3efe4] p-1 sm:p-2">
        <RomaniaMap states={states} />
      </div>
    </Polaroid>
  );
}
