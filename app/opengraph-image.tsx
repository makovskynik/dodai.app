import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "dodai.app — українські цифрові продукти";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "#F6F4EF",
          color: "#141616",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span style={{ fontSize: 64, fontWeight: 700 }}>dodai</span>
          <span style={{ fontSize: 64, fontWeight: 700, color: "#C76B4C" }}>
            +
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 48, fontWeight: 600, lineHeight: 1.15, maxWidth: 900 }}>
            Знайди український цифровий продукт для своєї задачі.
          </div>
          <div style={{ fontSize: 24, color: "rgba(20,22,22,0.7)" }}>
            Каталог · голоси · чесне просування
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
