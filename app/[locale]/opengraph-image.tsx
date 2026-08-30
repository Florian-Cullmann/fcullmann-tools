import { ImageResponse } from "next/og";

export const alt = "Florian Cullmann — developer tools and software projects";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        background: "#f5f7fb",
        color: "#252832",
        display: "flex",
        flexDirection: "column",
        fontFamily: "sans-serif",
        height: "100%",
        justifyContent: "space-between",
        padding: "72px 80px",
        width: "100%",
      }}
    >
      <div style={{ alignItems: "center", display: "flex", gap: 18 }}>
        <div
          style={{
            alignItems: "center",
            background: "#e84b3c",
            borderRadius: 14,
            color: "white",
            display: "flex",
            fontSize: 20,
            fontWeight: 800,
            height: 48,
            justifyContent: "center",
            width: 48,
          }}
        >
          {"</>"}
        </div>
        <div style={{ display: "flex", fontSize: 22, fontWeight: 750 }}>
          fcullmann.com
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 940 }}>
        <div
          style={{
            display: "flex",
            fontSize: 74,
            fontWeight: 800,
            letterSpacing: "-0.045em",
            lineHeight: 1.04,
          }}
        >
          Developer tools for focused work
        </div>
        <div
          style={{
            color: "#606673",
            display: "flex",
            fontSize: 28,
            fontWeight: 500,
            marginTop: 22,
          }}
        >
          Fast, privacy-conscious browser utilities by Florian Cullmann
        </div>
      </div>
      <div
        style={{
          alignItems: "center",
          display: "flex",
          fontSize: 21,
          justifyContent: "space-between",
        }}
      >
        <span>Useful software, carefully made.</span>
        <span style={{ color: "#e84b3c", display: "flex", fontWeight: 700 }}>
          Tools · Projects · Writing
        </span>
      </div>
    </div>,
    size,
  );
}
