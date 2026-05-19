import React from "react";

export default function TemplatePremium({ resume, options }) {
  const accent = options?.accentColor || "#0073b1";
  const showSummary = options?.showSummary ?? true;
  const showLinks = options?.showLinks ?? true;
  const compact = options?.compact ?? false;

  return (
    <div
      style={{
        padding: 0,
        color: "#0b1220",
        background: "#ffffff",
      }}
    >
      <div
        style={{
          padding: compact ? "20px 22px" : "26px 28px",
          background: `linear-gradient(135deg, ${accent}, ${accent}CC, ${accent}99)`,
          color: "#fff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -80,
            top: -80,
            width: 240,
            height: 240,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.14)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 60,
            bottom: -90,
            width: 240,
            height: 240,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.10)",
          }}
        />

        <div style={{ position: "relative" }}>
          <h2 style={{ margin: 0, fontSize: 30, fontWeight: 900 }}>{resume.name}</h2>
          <div style={{ marginTop: 6, fontSize: 13.5, opacity: 0.95 }}>{resume.headline}</div>

          <div style={{ marginTop: 10, display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12, opacity: 0.95 }}>
            {resume.location ? <span>{resume.location}</span> : null}
            {resume.email ? <span>{resume.email}</span> : null}
            {resume.phone ? <span>{resume.phone}</span> : null}
          </div>
        </div>
      </div>

      <div style={{ padding: "18px 28px 26px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: 14,
              padding: 14,
              background: "linear-gradient(180deg, #ffffff, #f8fbff)",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 0.7, color: accent }}>PROFILE</div>
            {showSummary ? (
              <div style={{ marginTop: 8, fontSize: 12.7, lineHeight: 1.65, color: "#334155" }}>
                {resume.summary || "Add a strong bio/summary in your profile to make this section shine."}
              </div>
            ) : (
              <div style={{ marginTop: 8, fontSize: 12.7, lineHeight: 1.65, color: "#64748b" }}>
                Summary hidden (Customize → Show Summary)
              </div>
            )}
          </div>

          <div style={{ border: "1px solid #e2e8f0", borderRadius: 14, padding: 14, background: "#ffffff" }}>
            <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 0.7, color: accent }}>SKILLS</div>
            <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {(resume.skills || []).slice(0, 24).map((s) => (
                <span
                  key={s}
                  style={{
                    fontSize: 11.5,
                    padding: "6px 10px",
                    borderRadius: 999,
                    background: `${accent}14`,
                    border: `1px solid ${accent}2a`,
                    color: accent,
                    fontWeight: 700,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1.35fr 0.65fr", gap: 16 }}>
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 14, padding: 14, background: "#ffffff" }}>
            <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 0.7, color: accent }}>EXPERIENCE</div>
            <div style={{ marginTop: 10 }}>
              {(resume.experiences || []).slice(0, 6).map((e, idx) => (
                <div key={idx} style={{ padding: "10px 0", borderBottom: "1px dashed #e2e8f0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 900 }}>{e.title || e.role || "Role"}</div>
                    <div style={{ fontSize: 11.5, color: "#64748b" }}>{e.duration || ""}</div>
                  </div>
                  <div style={{ fontSize: 12.5, color: "#334155" }}>{e.company || "Company"}</div>
                  {e.description ? (
                    <div style={{ marginTop: 6, fontSize: 12.5, color: "#475569", lineHeight: 1.55 }}>{e.description}</div>
                  ) : null}
                </div>
              ))}
              {!resume.experiences?.length ? (
                <div style={{ fontSize: 12, color: "#64748b" }}>Add experience in your profile to show it here.</div>
              ) : null}
            </div>
          </div>

          <div style={{ border: "1px solid #e2e8f0", borderRadius: 14, padding: 14, background: "#ffffff" }}>
            <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 0.7, color: accent }}>EDUCATION</div>
            <div style={{ marginTop: 10 }}>
              {(resume.education || []).slice(0, 4).map((ed, idx) => (
                <div key={idx} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 900 }}>{ed.institution || "Institute"}</div>
                  <div style={{ fontSize: 12.5, color: "#334155" }}>
                    {ed.degree || ""} {ed.year ? `• ${ed.year}` : ""}
                  </div>
                </div>
              ))}
              {!resume.education?.length ? (
                <div style={{ fontSize: 12, color: "#64748b" }}>Add education in your profile to show it here.</div>
              ) : null}

              {showLinks && resume.linkedin ? (
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 0.7, color: accent }}>LINK</div>
                  <div style={{ marginTop: 6, fontSize: 12, color: "#334155", wordBreak: "break-word" }}>{resume.linkedin}</div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


