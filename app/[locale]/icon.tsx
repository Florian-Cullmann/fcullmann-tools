import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#f3efe6",
        border: "4px solid #101c2c",
        color: "#101c2c",
        display: "flex",
        fontFamily: "sans-serif",
        fontSize: 34,
        fontWeight: 800,
        height: "100%",
        justifyContent: "center",
        letterSpacing: "-0.08em",
        width: "100%"
      }}
    >
      <span style={{ color: "#df4a32", display: "flex" }}>F</span>
      <span style={{ display: "flex" }}>U</span>
    </div>,
    size
  );
}
