import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Estateably";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0d6e6e",
          position: "relative",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15.47 7.1l-1.3 1.85c-0.2 0.29-0.54 0.47-0.9 0.47h-7.1V7.09H15.47z" fill="white"/>
          <polygon points="24.3,7.1 13.14,22.91 5.7,22.91 16.86,7.1" fill="white"/>
          <path d="M14.53 22.91l1.31-1.86c0.2-0.29 0.54-0.47 0.9-0.47h7.09v2.33H14.53z" fill="white"/>
        </svg>
      </div>
    ),
    { ...size }
  );
}
