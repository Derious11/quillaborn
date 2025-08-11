import { ImageResponse } from "next/og";
export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);

  const title = searchParams.get("title") || "Quillaborn";
  const subtitle = searchParams.get("subtitle") || "Quillaborn • Blog";
  const bg = searchParams.get("bg") || "/og-image.jpg";
  const bgUrl = bg.startsWith("http") ? bg : `${origin}${bg}`;

  const top = Number(searchParams.get("top") || 10);
  const safeTop = Number.isFinite(top) ? Math.max(40, Math.min(top, 300)) : 90;

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          position: "relative",
          color: "#F9F9F7",
          fontFamily: "Inter, Arial, sans-serif",
          display: "flex",            // 👈 required
          flexDirection: "column",    // 👈 required if multiple children
        }}
      >
        {/* Background */}
        <img
          src={bgUrl}
          width={1200}
          height={630}
          style={{ position: "absolute", inset: 0, objectFit: "cover" }}
        />

        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.05) 100%)",
          }}
        />

        {/* Content block */}
        <div
          style={{
            position: "absolute",
            left: 60,
            right: 60,
            top: safeTop,
            display: "flex",
            flexDirection: "column",
            maxWidth: 920,
          }}
        >
          <div
            style={{
              fontSize: 58,
              lineHeight: 1.1,
              fontWeight: 700,
              textShadow: "2px 2px 4px rgba(0,0,0,0.35)",
            }}
          >
            {title}
          </div>

          <div
            style={{
              marginTop: 18,
              fontSize: 30,
              color: "#D6D3D1",
              textShadow: "1px 1px 3px rgba(0,0,0,0.35)",
            }}
          >
            {subtitle}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
