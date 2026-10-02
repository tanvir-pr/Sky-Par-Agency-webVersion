import { ImageResponse } from "next/og";
import { SITE_CONFIG } from "@/lib/constants";

export const runtime = "edge";
export const alt = `${SITE_CONFIG.name} — Digital Agency`;
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
          justifyContent: "center",
          padding: "64px",
          background: "linear-gradient(135deg, #0f172a 0%, #312e81 50%, #6366f1 100%)",
          color: "white",
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 600,
            opacity: 0.85,
            marginBottom: 16,
          }}
        >
          Digital Agency
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            lineHeight: 1.1,
            maxWidth: 900,
          }}
        >
          {SITE_CONFIG.name}
        </div>
        <div
          style={{
            fontSize: 32,
            marginTop: 24,
            opacity: 0.9,
            maxWidth: 800,
            lineHeight: 1.4,
          }}
        >
          {SITE_CONFIG.tagline}
        </div>
      </div>
    ),
    { ...size }
  );
}
