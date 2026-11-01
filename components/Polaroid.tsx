import QuestionImage from "./QuestionImage";

/** Floating polaroid: white square frame, slightly tilted, with the question picture. */
export default function Polaroid({
  src,
  seed,
  alt,
  className = "",
}: {
  src?: string | null;
  seed: string;
  alt: string;
  className?: string;
}) {
  return (
    <figure
      className={`animate-pop rotate-[5deg] bg-white p-2 pb-7 shadow-[0_20px_35px_-14px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:rotate-0 hover:scale-105 sm:p-3 sm:pb-10 ${className}`}
    >
      <QuestionImage
        src={src}
        seed={seed}
        alt={alt}
        className="aspect-square !rounded-none"
      />
    </figure>
  );
}
