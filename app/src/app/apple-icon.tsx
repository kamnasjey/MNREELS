import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#000",
        }}
      >
        <span
          style={{
            fontSize: 36,
            fontWeight: 900,
            color: "#fff",
            letterSpacing: -1,
            lineHeight: 1,
          }}
        >
          MN
        </span>
        <span
          style={{
            fontSize: 30,
            fontWeight: 900,
            color: "#ff4757",
            letterSpacing: -1,
            lineHeight: 1,
          }}
        >
          REELS
        </span>
      </div>
    ),
    { ...size }
  );
}
