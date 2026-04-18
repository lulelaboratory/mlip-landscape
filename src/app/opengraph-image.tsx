import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "MLIP Hub – Interatomic Potential Explorer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const categories = [
    { label: "Equivariant", color: "#ef4444" },
    { label: "Invariant", color: "#3b82f6" },
    { label: "Transformer", color: "#22c55e" },
    { label: "Descriptor", color: "#f97316" },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #dbeafe 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "16px",
              background: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "48px",
              fontWeight: 800,
              boxShadow: "0 10px 30px rgba(37,99,235,0.35)",
            }}
          >
            M
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: "28px",
                color: "#475569",
                fontWeight: 600,
                letterSpacing: "0.05em",
              }}
            >
              mliphub.com
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              fontSize: "84px",
              fontWeight: 800,
              color: "#0f172a",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            MLIP Hub
          </div>
          <div
            style={{
              fontSize: "36px",
              color: "#334155",
              fontWeight: 500,
              lineHeight: 1.25,
              maxWidth: "1000px",
            }}
          >
            An interactive, curated map of machine-learning interatomic
            potentials — lineage, papers, and code.
          </div>
        </div>

        <div style={{ display: "flex", gap: "28px", flexWrap: "wrap" }}>
          {categories.map((c) => (
            <div
              key={c.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 18px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.8)",
                border: "1px solid rgba(15,23,42,0.08)",
                fontSize: "24px",
                fontWeight: 600,
                color: "#0f172a",
              }}
            >
              <div
                style={{
                  width: "14px",
                  height: "14px",
                  borderRadius: "999px",
                  background: c.color,
                }}
              />
              {c.label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
