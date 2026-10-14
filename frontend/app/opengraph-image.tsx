import { ImageResponse } from "next/og";

export const alt = "What do I wear today? Outfits from the clothes you already own.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Linen & Denim: textile swatches on a linen board, denim-ink type, one thread accent.
const tiles = [
  { color: "#bfd9bf", tilt: -3 },
  { color: "#eabca8", tilt: 3 },
  { color: "#b3cee7", tilt: 2 },
  { color: "#f6e8b3", tilt: -2.5 },
];

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
          background: "#faf6ee",
          color: "#131f35",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 640 }}>
          <div style={{ fontSize: 92, fontWeight: 700, lineHeight: 1, letterSpacing: -3 }}>What do I wear</div>
          <div style={{ fontSize: 92, fontWeight: 700, lineHeight: 1.05, letterSpacing: -3, color: "#c4472a" }}>
            today?
          </div>
          <div style={{ marginTop: 36, fontSize: 34, color: "#545e6f" }}>Outfits from the clothes you already own.</div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", width: 360, gap: 20 }}>
          {tiles.map(({ color, tilt }) => (
            <div
              key={color}
              style={{
                display: "flex",
                width: 170,
                height: 212,
                padding: 8,
                borderRadius: 18,
                background: "#fffdfa",
                boxShadow: "0 18px 30px -18px rgba(19, 31, 53, 0.35)",
                transform: `rotate(${tilt}deg)`,
              }}
            >
              <div style={{ width: "100%", height: "100%", borderRadius: 12, background: color }} />
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
