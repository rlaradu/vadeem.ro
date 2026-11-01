import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** iOS home-screen icon (iOS rounds the corners itself, so it is a full square). */
export default function AppleIcon() {
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
          fontSize: 106,
          fontWeight: 800,
          letterSpacing: -4,
        }}
      >
        v_
      </div>
    ),
    size,
  );
}
