import { ImageResponse } from "next/og";

export const alt = "vadeem.ro – trei întrebări, zero Google";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Preview image shown when the site is shared (WhatsApp, Facebook, X...). */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#e9e6dd",
        }}
      >
        <div
          style={{
            width: 1060,
            height: 490,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 56,
            borderRadius: 64,
            background: "#d93a28",
            color: "#fff",
          }}
        >
          <div style={{ display: "flex", fontSize: 34, fontWeight: 700 }}>
            vadeem.ro_
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 112,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: -4,
            }}
          >
            <div style={{ display: "flex" }}>Trei întrebări.</div>
            <div style={{ display: "flex" }}>Zero Google.</div>
          </div>
          <div style={{ display: "flex", fontSize: 30, opacity: 0.85 }}>
            {"// jocul zilnic de estimare"}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
