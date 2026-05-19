import React from "react";

export default function TemplateModern({ resume, options }) {
  const accent = options?.accentColor || "#7dd3fc";
  const showSummary = options?.showSummary ?? true;
  const showLinks = options?.showLinks ?? true;
  const compact = options?.compact ?? false;

  return (
    <div style={{ padding: 0, background: "#ffffff", color: "#0f172a" }}>
      <div style={{ display: "grid", gridTemplateColumns: "0.38fr 0.62fr", minHeight: 800 }}>
        {/* Left rail */}
        <aside
          style={{
            background: "#0f172a",
            color: "#fff",
            padding: compact ? "20px 14px" : "26px 18px",
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1.15 }}>{resume.name}</div>
          <div style={{ marginTop: 8, fontSize: 12.5, opacity: 0.9 }}>{resume.headline}</div>

          <div style={{ marginTop: 14, fontSize: 11.5, opacity: 0.85, lineHeight: 1.6 }}>
            {resume.location ? <div>{resume.location}</div> : null}
            {resume.email ? <div>{resume.email}</div> : null}
            {resume.phone ? <div>{resume.phone}</div> : null}
            {showLinks && resume.linkedin ? <div style={{ wordBreak: "break-word" }}>{resume.linkedin}</div> : null}
          </div>

          <div style={{ marginTop: 18, borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: 0.8, color: accent }}>SKILLS</div>
            <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {(resume.skills || []).slice(0, 22).map((s) => (
                <span
                  key={s}
                  style={{
                    fontSize: 11,
                    padding: "6px 10px",
                    borderRadius: 999,
                    background: `${accent}1f`,
                    border: `1px solid ${accent}38`,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </aside>

        {/* Main */}
        <main style={{ padding: compact ? "20px 18px" : "26px 22px" }}>
          {showSummary ? (
            <section style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: 0.8, color: accent }}>ABOUT</div>
              <div style={{ marginTop: 8, fontSize: 12.7, lineHeight: 1.7, color: "#334155" }}>
                {resume.summary || "Add a short bio in your profile to show it here."}
              </div>
            </section>
          ) : null}

          <section style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: 0.8, color: accent }}>EXPERIENCE</div>
            <div style={{ marginTop: 8 }}>
              {(resume.experiences || []).slice(0, 6).map((e, idx) => (
                <div key={idx} style={{ padding: "10px 0", borderBottom: "1px solid #eef2f7" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 900 }}>{e.title || e.role || "Role"}</div>
                    <div style={{ fontSize: 11.5, color: "#64748b" }}>{e.duration || ""}</div>
                  </div>
                  <div style={{ fontSize: 12.5, color: "#334155" }}>{e.company || "Company"}</div>
                  {e.description ? (
                    <div style={{ marginTop: 6, fontSize: 12.5, color: "#475569", lineHeight: 1.6 }}>{e.description}</div>
                  ) : null}
                </div>
              ))}
              {!resume.experiences?.length ? (
                <div style={{ fontSize: 12, color: "#64748b" }}>Add experience in your profile to show it here.</div>
              ) : null}
            </div>
          </section>

          <section>
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: 0.8, color: accent }}>EDUCATION</div>
            <div style={{ marginTop: 8 }}>
              {(resume.education || []).slice(0, 4).map((ed, idx) => (
                <div key={idx} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 900 }}>{ed.institution || "Institute"}</div>
                  <div style={{ fontSize: 12.5, color: "#334155" }}>
                    {ed.degree || ""} {ed.year ? `• ${ed.year}` : ""}
                  </div>
                </div>
              ))}
              {!resume.education?.length ? (
                <div style={{ fontSize: 12, color: "#64748b" }}>Add education in your profile to show it here.</div>
              ) : null}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}


