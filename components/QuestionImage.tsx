/* eslint-disable @next/next/no-img-element -- admin-uploaded images come from any Supabase host */

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Generic abstract artwork, unique and stable per seed. Used when a question has no image. */
function GeneratedArt({ seed }: { seed: string }) {
  const h = hash(seed);
  // Stays inside the site palette: coral/red to deep maroon, with white shapes.
  const hue1 = 4 + (h % 14);
  const hue2 = 350 + ((h >> 8) % 10);
  const id = `g${h}`;
  const circles = Array.from({ length: 5 }, (_, i) => {
    const n = hash(`${seed}:${i}`);
    return {
      cx: n % 320,
      cy: (n >> 9) % 140,
      r: 20 + ((n >> 17) % 70),
      hue: i % 2 ? hue1 : hue2,
      o: 0.18 + (i % 3) * 0.1,
    };
  });
  return (
    <svg
      viewBox="0 0 320 140"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={`hsl(${hue1} 85% 58%)`} />
          <stop offset="1" stopColor={`hsl(${hue2} 70% 34%)`} />
        </linearGradient>
      </defs>
      <rect width="320" height="140" fill={`url(#${id})`} />
      {circles.map((c, i) => (
        <circle key={i} cx={c.cx} cy={c.cy} r={c.r} fill="#fff" opacity={c.o} />
      ))}
      {[28, 52, 76].map((r) => (
        <circle
          key={r}
          cx={(h >> 4) % 320}
          cy={(h >> 13) % 140}
          r={r}
          fill="none"
          stroke="#fff"
          strokeOpacity="0.35"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  );
}

/** Question picture: the uploaded image, or generated artwork as a fallback. */
export default function QuestionImage({
  src,
  seed,
  alt,
  className = "aspect-[16/7]",
}: {
  src?: string | null;
  seed: string;
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-accent-soft ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        <GeneratedArt seed={seed} />
      )}
    </div>
  );
}
