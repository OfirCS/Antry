import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

const LIME = "#C6F135";
const INK = "#0A0A0A";
const CREAM = "#F5F0E8";

const VARIANT_LABEL: Record<string, string> = {
  default: "Antry",
  project: "Project",
  builder: "Builder",
  blog: "Build Log",
  hackathon: "Antathon",
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") || "Where builders ship, not pitch").slice(0, 120);
  const subtitle = (searchParams.get("subtitle") || "").slice(0, 180);
  const eyebrow = (searchParams.get("eyebrow") || "").slice(0, 32);
  const variant = searchParams.get("variant") || "default";
  const eyebrowText = eyebrow || VARIANT_LABEL[variant] || "Antry";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: INK,
          color: "#FFFFFF",
          fontFamily: "system-ui, -apple-system, Segoe UI, Helvetica, sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -180,
            right: -180,
            width: 520,
            height: 520,
            borderRadius: 9999,
            background: `radial-gradient(circle, rgba(198,241,53,0.30) 0%, rgba(198,241,53,0) 65%)`,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -240,
            left: -160,
            width: 540,
            height: 540,
            borderRadius: 9999,
            background: `radial-gradient(circle, rgba(198,241,53,0.10) 0%, rgba(198,241,53,0) 70%)`,
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "#000",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: LIME,
              fontWeight: 800,
              fontSize: 28,
              letterSpacing: -1,
            }}
          >
            A
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 0.4 }}>Antry</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
              Proof of work for AI builders
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1040 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              alignSelf: "flex-start",
              gap: 10,
              padding: "8px 14px",
              borderRadius: 9999,
              background: "rgba(198,241,53,0.12)",
              border: "1px solid rgba(198,241,53,0.25)",
              color: LIME,
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: 1.2,
              textTransform: "uppercase",
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: 9999, background: LIME, display: "flex" }} />
            {eyebrowText}
          </div>

          <div
            style={{
              fontSize: title.length > 70 ? 60 : 76,
              lineHeight: 1.05,
              fontWeight: 800,
              letterSpacing: -2,
              color: "#FFFFFF",
              display: "flex",
            }}
          >
            {title}
          </div>

          {subtitle ? (
            <div
              style={{
                fontSize: 26,
                lineHeight: 1.4,
                color: "rgba(255,255,255,0.65)",
                maxWidth: 980,
                display: "flex",
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "rgba(255,255,255,0.5)",
            fontSize: 18,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ color: LIME, fontWeight: 700 }}>antry.com</span>
            <span>·</span>
            <span>Don&apos;t tell us. Show us.</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: 9999, background: CREAM, display: "flex" }} />
            <div style={{ width: 10, height: 10, borderRadius: 9999, background: LIME, display: "flex" }} />
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
