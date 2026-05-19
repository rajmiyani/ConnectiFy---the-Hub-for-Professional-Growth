import React from "react";

export default function TemplateNormal({ resume, options }) {
  const accent = options?.accentColor || "#0073b1";
  const showSummary = options?.showSummary ?? true;
  const showLinks = options?.showLinks ?? true;
  const compact = options?.compact ?? false;
  const headerBg = `linear-gradient(90deg, ${accent}, ${accent}CC)`;

  return (
    <div style={{ padding: 0, color: "#0f172a" }}>
      <div style={{ padding: "22px 26px", background: headerBg, color: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-end" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>{resume.name}</h2>
            <div style={{ marginTop: 6, fontSize: 13, opacity: 0.95 }}>{resume.headline}</div>
          </div>
          <div style={{ fontSize: 12, textAlign: "right", opacity: 0.95 }}>
            {resume.location ? <div>{resume.location}</div> : null}
            {resume.email ? <div>{resume.email}</div> : null}
            {resume.phone ? <div>{resume.phone}</div> : null}
          </div>
        </div>
      </div>

      <div style={{ padding: compact ? "14px 22px" : "18px 26px" }}>
        {showSummary && resume.summary ? (
          <div style={{ marginBottom: 14, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 0.6, color: accent }}>ABOUT</div>
            <div style={{ marginTop: 6, fontSize: 12.5, lineHeight: 1.6, color: "#334155" }}>{resume.summary}</div>
          </div>
        ) : null}

        <div style={{ display: "grid", gridTemplateColumns: "1.25fr 0.75fr", gap: 18 }}>
          <section>
            <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 0.6, color: accent, marginBottom: 8 }}>
              EXPERIENCE
            </div>
            {(resume.experiences || []).slice(0, 5).map((e, idx) => (
              <div key={idx} style={{ padding: "10px 0", borderBottom: "1px dashed #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ fontSize: 13.2, fontWeight: 800 }}>{e.title || e.role || "Role"}</div>
                  <div style={{ fontSize: 11.5, color: "#64748b" }}>{e.duration || ""}</div>
                </div>
                <div style={{ fontSize: 12, color: "#334155" }}>{e.company || "Company"}</div>
                {e.description ? (
                  <div style={{ fontSize: 12, color: "#475569", marginTop: 6, lineHeight: 1.55 }}>{e.description}</div>
                ) : null}
              </div>
            ))}
            {!resume.experiences?.length ? (
              <div style={{ fontSize: 12, color: "#64748b" }}>Add experience in your profile to show it here.</div>
            ) : null}
          </section>

          <aside>
            <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 0.6, color: accent, marginBottom: 8 }}>
              SKILLS
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {(resume.skills || []).slice(0, 20).map((s) => (
                <span key={s} style={{ fontSize: 11.5, padding: "6px 10px", borderRadius: 10, background: `${accent}12`, border: `1px solid ${accent}2a` }}>
                  {s}
                </span>
              ))}
            </div>

            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 0.6, color: accent, marginBottom: 8 }}>
                EDUCATION
              </div>
              {(resume.education || []).slice(0, 3).map((ed, idx) => (
                <div key={idx} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 12.8, fontWeight: 800 }}>{ed.institution || "Institute"}</div>
                  <div style={{ fontSize: 12, color: "#334155" }}>
                    {ed.degree || ""} {ed.year ? `• ${ed.year}` : ""}
                  </div>
                </div>
              ))}
              {!resume.education?.length ? (
                <div style={{ fontSize: 12, color: "#64748b" }}>Add education in your profile to show it here.</div>
              ) : null}
            </div>

            {showLinks && resume.linkedin ? (
              <div style={{ marginTop: 14, fontSize: 12, color: accent }}>
                <div style={{ fontWeight: 900, letterSpacing: 0.6, marginBottom: 6 }}>LINKS</div>
                <div style={{ wordBreak: "break-word" }}>{resume.linkedin}</div>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  );
}


