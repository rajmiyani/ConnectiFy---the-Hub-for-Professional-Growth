import React from "react";

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 0.7, color: "#111827" }}>{title}</div>
      <div style={{ marginTop: 8 }}>{children}</div>
    </div>
  );
}

export default function TemplateStandard({ resume, options }) {
  const accent = options?.accentColor || "#0073b1";
  const showSummary = options?.showSummary ?? true;
  const showLinks = options?.showLinks ?? true;
  const compact = options?.compact ?? false;

  return (
    <div style={{ padding: compact ? 20 : 26, color: "#0f172a" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 30, fontWeight: 900, letterSpacing: -0.3 }}>{resume.name}</h2>
          <div style={{ marginTop: 6, fontSize: 13, color: "#334155", fontWeight: 700 }}>{resume.headline}</div>
        </div>
        <div style={{ fontSize: 12, color: "#334155", textAlign: "right" }}>
          {resume.location ? <div>{resume.location}</div> : null}
          {resume.email ? <div>{resume.email}</div> : null}
          {resume.phone ? <div>{resume.phone}</div> : null}
        </div>
      </div>

      <div style={{ marginTop: 16, borderTop: "1px solid #e5e7eb", paddingTop: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "0.85fr 1.15fr", gap: 18 }}>
          <aside style={{ borderRight: "1px solid #f1f5f9", paddingRight: 14 }}>
            {showSummary ? (
              <Section title="SUMMARY">
                <div style={{ fontSize: 12.5, lineHeight: 1.6, color: "#334155" }}>
                  {resume.summary || "Add a short summary in your profile bio to show it here."}
                </div>
              </Section>
            ) : null}

            <Section title="SKILLS">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {(resume.skills || []).slice(0, 22).map((s) => (
                  <span key={s} style={{ fontSize: 11.5, padding: "6px 10px", borderRadius: 999, background: `${accent}10` }}>
                    {s}
                  </span>
                ))}
              </div>
            </Section>

            {showLinks ? (
              <Section title="LINKS">
                <div style={{ fontSize: 12, color: "#334155", wordBreak: "break-word" }}>
                  {resume.linkedin || "Add LinkedIn URL in your profile."}
                </div>
              </Section>
            ) : null}
          </aside>

          <main>
            <Section title="EXPERIENCE">
              {(resume.experiences || []).slice(0, 6).map((e, idx) => (
                <div key={idx} style={{ marginBottom: 12 }}>
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
            </Section>

            <Section title="EDUCATION">
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
            </Section>
          </main>
        </div>
      </div>
    </div>
  );
}


