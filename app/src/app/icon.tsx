import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 108,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: -10,
          }}
        >
          <span
            style={{
              fontSize: 120,
              fontWeight: 900,
              color: "#fff",
              letterSpacing: -4,
              lineHeight: 1,
            }}
          >
            MN
          </span>
          <span
            style={{
              fontSize: 100,
              fontWeight: 900,
              color: "#ff4757",
              letterSpacing: -3,
              lineHeight: 1,
            }}
          >
            REELS
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
