import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Estateably";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0d6e6e",
        }}
      >
        <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
