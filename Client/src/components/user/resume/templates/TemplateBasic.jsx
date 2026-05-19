import React from "react";

export default function TemplateBasic({ resume, options }) {
  const accent = options?.accentColor || "#0073b1";
  const showSummary = options?.showSummary ?? true;
  const compact = options?.compact ?? false;

  return (
    <div style={{ padding: compact ? 22 : 28, color: "#111827" }}>
      <div style={{ borderBottom: "2px solid #e5e7eb", paddingBottom: 14, marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>{resume.name}</h2>
        <div style={{ marginTop: 6, color: "#374151", fontSize: 13 }}>
          <span style={{ fontWeight: 600 }}>{resume.headline}</span>
          <span style={{ margin: "0 10px", color: "#9ca3af" }}>•</span>
          <span>{resume.location}</span>
        </div>
        <div style={{ marginTop: 8, color: "#4b5563", fontSize: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
          {resume.email ? <span>{resume.email}</span> : null}
          {resume.phone ? <span>{resume.phone}</span> : null}
          {resume.linkedin ? <span>{resume.linkedin}</span> : null}
        </div>
      </div>

      {showSummary && resume.summary ? (
        <section style={{ marginBottom: 14 }}>
          <h4 style={{ fontSize: 14, letterSpacing: 0.6, marginBottom: 8, color: "#111827" }}>SUMMARY</h4>
          <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6, color: "#374151" }}>{resume.summary}</p>
        </section>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <section>
          <h4 style={{ fontSize: 14, letterSpacing: 0.6, marginBottom: 8 }}>EXPERIENCE</h4>
          {resume.experiences?.length ? (
            resume.experiences.slice(0, 4).map((e, idx) => (
              <div key={idx} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{e.title || e.role || "Role"}</div>
                <div style={{ fontSize: 12, color: "#374151" }}>
                  {(e.company || "Company")} {e.duration ? `• ${e.duration}` : ""}
                </div>
                {e.description ? (
                  <div style={{ fontSize: 12, color: "#4b5563", marginTop: 4, lineHeight: 1.55 }}>
                    {e.description}
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <div style={{ fontSize: 12, color: "#6b7280" }}>Add experience in your profile to show it here.</div>
          )}
        </section>

        <section>
          <h4 style={{ fontSize: 14, letterSpacing: 0.6, marginBottom: 8 }}>SKILLS</h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {(resume.skills || []).slice(0, 18).map((s) => (
              <span
                key={s}
                style={{
                  fontSize: 12,
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: "rgba(0,115,177,0.10)",
                  color: "#1f2937",
                  border: `1px solid ${accent}33`,
                }}
              >
                {s}
              </span>
            ))}
          </div>

          <div style={{ marginTop: 14 }}>
            <h4 style={{ fontSize: 14, letterSpacing: 0.6, marginBottom: 8 }}>EDUCATION</h4>
            {resume.education?.length ? (
              resume.education.slice(0, 3).map((ed, idx) => (
                <div key={idx} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{ed.institution || "Institute"}</div>
                  <div style={{ fontSize: 12, color: "#374151" }}>
                    {ed.degree || ""} {ed.year ? `• ${ed.year}` : ""}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ fontSize: 12, color: "#6b7280" }}>Add education in your profile to show it here.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}


