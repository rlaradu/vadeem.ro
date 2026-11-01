import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

/** Site icon / app icon: white "v_" on the card red. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#d93a28",
          color: "#fff",
          fontSize: 300,
          fontWeight: 800,
          letterSpacing: -10,
          borderRadius: 112,
        }}
      >
        v_
      </div>
    ),
    size,
  );
}
