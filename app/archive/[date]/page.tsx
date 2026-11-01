import { Suspense } from "react";
import ArchiveGame from "./ArchiveGame";

export default function ArchiveDatePage(props: PageProps<"/archive/[date]">) {
  // `params` is request-time data, so it is read inside a Suspense boundary.
  return (
    <Suspense fallback={<p className="py-16 text-center font-bold">Se încarcă…</p>}>
      <ArchiveGame params={props.params} />
    </Suspense>
  );
}
