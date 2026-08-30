import { ImageResponse } from "next/og";

export const alt = "Florian Ullmann — software engineer and developer tools";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        background: "#f3efe6",
        color: "#101c2c",
        display: "flex",
        flexDirection: "column",
        fontFamily: "sans-serif",
        height: "100%",
        justifyContent: "space-between",
        padding: "72px 80px",
        position: "relative",
        width: "100%"
      }}
    >
      <div
        style={{
          border: "2px solid #101c2c",
          display: "flex",
          height: 26,
          left: 80,
          position: "absolute",
          top: 72,
          width: 26
        }}
      >
        <div style={{ background: "#df4a32", display: "flex", height: 10, width: 10 }} />
      </div>
      <div style={{ display: "flex", fontSize: 20, fontWeight: 700, letterSpacing: "0.16em", marginLeft: 44, textTransform: "uppercase" }}>
        fcullmann.com · API Atlas
      </div>
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 880 }}>
        <div style={{ display: "flex", fontSize: 84, fontWeight: 800, letterSpacing: "-0.055em", lineHeight: 1 }}>
          Florian Ullmann
        </div>
        <div style={{ color: "#df4a32", display: "flex", fontSize: 34, fontWeight: 600, marginTop: 22 }}>
          Software engineer & developer tools
        </div>
      </div>
      <div style={{ alignItems: "center", display: "flex", fontSize: 22, justifyContent: "space-between" }}>
        <span>Useful software, carefully made.</span>
        <span style={{ color: "#377a8c", display: "flex", fontFamily: "monospace" }}>52.5200° N · 13.4050° E</span>
      </div>
    </div>,
    size
  );
}
