import { ImageResponse } from "next/og";

export const alt = "What do I wear today? Outfits from the clothes you already own.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const tiles = ["#ff9ce9", "#ffc2ba", "#ff8da1", "#ad56c4"];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "72px 88px",
          background: "#fff8fb",
          color: "#29122e",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 640 }}>
          <div style={{ fontSize: 92, fontWeight: 700, lineHeight: 1, letterSpacing: -3 }}>
            What do I wear
          </div>
          <div style={{ fontSize: 92, fontWeight: 700, lineHeight: 1.05, letterSpacing: -3, color: "#ad56c4" }}>
            today?
          </div>
          <div style={{ marginTop: 36, fontSize: 34, color: "#654f6a" }}>
            Outfits from the clothes you already own.
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", width: 360, gap: 20 }}>
          {tiles.map((color, i) => (
            <div
              key={color}
              style={{
                width: 170,
                height: 212,
                borderRadius: 24,
                background: color,
                transform: `rotate(${i % 2 === 0 ? -3 : 3}deg)`,
              }}
            />
          ))}
        </div>
      </div>
    ),
    size,
  );
}
