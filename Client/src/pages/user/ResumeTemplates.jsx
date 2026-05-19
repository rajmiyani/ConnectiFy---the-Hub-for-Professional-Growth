import React from "react";
import { FaDownload, FaPalette, FaRegFileAlt } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { buildResumeFromUser } from "../../components/user/resume/resumeProfileAdapter";
import ResumeTemplateRenderer, { getResumeTemplates } from "../../components/user/resume/ResumeTemplateRenderer";
import { downloadResumePdf } from "../../utils/resume/downloadResumePdf";
import { generateAiResumeFromProfile } from "../../utils/resume/aiResumeGenerator";

const COLORS = {
  primary: "#0073b1",
  bg: "#F4F7FB",
  card: "#FFFFFF",
  text: "#1E293B",
  border: "#E2E8F0",
};

export default function ResumeTemplates() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const baseResume = React.useMemo(() => buildResumeFromUser(user), [user]);
  const templates = React.useMemo(() => getResumeTemplates(), []);
  const [searchParams] = useSearchParams();

  const [templateKey, setTemplateKey] = React.useState("basic");
  const [paper, setPaper] = React.useState("a4");
  const [downloading, setDownloading] = React.useState(false);
  const [useAi, setUseAi] = React.useState(false);

  const [accentColor, setAccentColor] = React.useState("#0073b1");
  const [fontFamily, setFontFamily] = React.useState("Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif");
  const [showSummary, setShowSummary] = React.useState(true);
  const [showLinks, setShowLinks] = React.useState(true);
  const [compact, setCompact] = React.useState(false);
  const previewRef = React.useRef(null);

  const resume = React.useMemo(() => {
    if (!useAi) return baseResume;
    return generateAiResumeFromProfile(baseResume);
  }, [baseResume, useAi]);

  const options = React.useMemo(() => {
    return {
      accentColor,
      fontFamily,
      showSummary,
      showLinks,
      compact,
    };
  }, [accentColor, fontFamily, showSummary, showLinks, compact]);

  const fileName = `${(resume.name || "resume").replaceAll(" ", "_")}_${templateKey}.pdf`;

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await downloadResumePdf({
        element: previewRef.current,
        fileName,
        scale: 2,
      });
    } finally {
      setDownloading(false);
    }
  };

  React.useEffect(() => {
    const wantsDownload = searchParams.get("download") === "1";
    const wantsTemplate = searchParams.get("template");
    const wantsAi = searchParams.get("ai") === "1";

    if (wantsTemplate && templates.some((t) => t.key === wantsTemplate)) {
      setTemplateKey(wantsTemplate);
    }

    if (wantsAi) setUseAi(true);

    // Auto-download after first paint (when opened from Profile)
    if (wantsDownload) {
      const t = setTimeout(() => {
        handleDownload().catch(() => {});
      }, 450);
      return () => clearTimeout(t);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: COLORS.bg, minHeight: "100vh" }}>
      <div className="container">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
          <div>
            <h4 className="fw-bold mb-1" style={{ color: COLORS.text }}>
              <FaRegFileAlt className="me-2" style={{ color: COLORS.primary }} />
              Resume Templates
            </h4>
            <div className="text-muted small">
              Build your resume automatically from your ConnectiFy profile and download it as PDF.
            </div>
          </div>

          <button
            className="btn btn-primary rounded-pill px-4 py-2 fw-semibold shadow-sm"
            style={{ backgroundColor: COLORS.primary, border: "none" }}
            onClick={handleDownload}
            disabled={downloading}
            title="Download as PDF"
          >
            <FaDownload className="me-2" />
            {downloading ? "Preparing PDF..." : "Download PDF"}
          </button>
        </div>

        <div className="row g-4">
          {/* Controls */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden" style={{ backgroundColor: COLORS.card }}>
              <div className="p-4 border-bottom">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <FaPalette style={{ color: COLORS.primary }} />
                  <h6 className="fw-bold mb-0">Choose Template</h6>
                </div>
                <div className="text-muted small">Pick a style: Basic, Normal, Standard, Premium, Modern.</div>
              </div>

              <div className="p-3">
                <div className="accordion" id="resumeTemplateAccordion">
                  <div className="accordion-item border-0">
                    <h2 className="accordion-header" id="headingTemplates">
                      <button className="accordion-button fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTemplates">
                        Templates
                      </button>
                    </h2>
                    <div id="collapseTemplates" className="accordion-collapse collapse show" data-bs-parent="#resumeTemplateAccordion">
                      <div className="accordion-body">
                        <div className="row g-2">
                          {templates.map((t) => (
                            <div className="col-6" key={t.key}>
                              <button
                                type="button"
                                className={`btn w-100 text-start border rounded-3 p-2 ${templateKey === t.key ? "btn-light" : "btn-white"}`}
                                style={{
                                  borderColor: templateKey === t.key ? COLORS.primary : COLORS.border,
                                  boxShadow: templateKey === t.key ? "0 0 0 3px rgba(0,115,177,0.12)" : "none",
                                }}
                                onClick={() => setTemplateKey(t.key)}
                              >
                                <div className="fw-bold" style={{ fontSize: 13 }}>
                                  {t.label}
                                </div>
                                <div className="text-muted" style={{ fontSize: 11 }}>
                                  {t.key === "basic" ? "Clean & ATS-friendly" : null}
                                  {t.key === "normal" ? "ConnectiFy blue" : null}
                                  {t.key === "standard" ? "Balanced layout" : null}
                                  {t.key === "premium" ? "Executive look" : null}
                                  {t.key === "modern" ? "Dark rail style" : null}
                                </div>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="accordion-item border-0 mt-2">
                    <h2 className="accordion-header" id="headingCustomize">
                      <button className="accordion-button collapsed fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#collapseCustomize">
                        Customize (Colors & Layout)
                      </button>
                    </h2>
                    <div id="collapseCustomize" className="accordion-collapse collapse" data-bs-parent="#resumeTemplateAccordion">
                      <div className="accordion-body">
                        <div className="mb-3">
                          <label className="form-label small fw-bold text-muted">Accent Color</label>
                          <div className="d-flex align-items-center gap-2">
                            <input
                              type="color"
                              value={accentColor}
                              onChange={(e) => setAccentColor(e.target.value)}
                              className="form-control form-control-color"
                              title="Choose accent color"
                            />
                            <input
                              type="text"
                              value={accentColor}
                              onChange={(e) => setAccentColor(e.target.value)}
                              className="form-control"
                              placeholder="#0073b1"
                            />
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="form-label small fw-bold text-muted">Font</label>
                          <select className="form-select" value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
                            <option value="Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif">Inter (Default)</option>
                            <option value="system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif">System UI</option>
                            <option value="Georgia, 'Times New Roman', Times, serif">Serif (Georgia)</option>
                            <option value="'Trebuchet MS', Arial, sans-serif">Trebuchet</option>
                          </select>
                        </div>

                        <div className="d-flex flex-column gap-2">
                          <div className="form-check form-switch">
                            <input className="form-check-input" type="checkbox" role="switch" checked={showSummary} onChange={() => setShowSummary((v) => !v)} />
                            <label className="form-check-label">Show Summary</label>
                          </div>
                          <div className="form-check form-switch">
                            <input className="form-check-input" type="checkbox" role="switch" checked={showLinks} onChange={() => setShowLinks((v) => !v)} />
                            <label className="form-check-label">Show Links (LinkedIn)</label>
                          </div>
                          <div className="form-check form-switch">
                            <input className="form-check-input" type="checkbox" role="switch" checked={compact} onChange={() => setCompact((v) => !v)} />
                            <label className="form-check-label">Compact Spacing</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="accordion-item border-0 mt-2">
                    <h2 className="accordion-header" id="headingAi">
                      <button className="accordion-button collapsed fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#collapseAi">
                        AI Generator (From Profile)
                      </button>
                    </h2>
                    <div id="collapseAi" className="accordion-collapse collapse" data-bs-parent="#resumeTemplateAccordion">
                      <div className="accordion-body">
                        <div className="small text-muted mb-3">
                          This is a frontend-only AI simulation that rewrites your summary and polishes experience using your profile data.
                        </div>
                        <div className="d-flex gap-2 flex-wrap">
                          <button
                            type="button"
                            className={`btn ${useAi ? "btn-primary" : "btn-outline-primary"} rounded-pill px-3`}
                            onClick={() => {
                              setUseAi((v) => !v);
                              showToast(!useAi ? "AI Resume enabled (profile-based)" : "AI Resume disabled", "info");
                            }}
                            style={useAi ? { backgroundColor: COLORS.primary, border: "none" } : {}}
                          >
                            {useAi ? "AI Enabled" : "Generate with AI"}
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-secondary rounded-pill px-3"
                            onClick={() => {
                              setUseAi(false);
                              setAccentColor("#0073b1");
                              setFontFamily("Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif");
                              setShowSummary(true);
                              setShowLinks(true);
                              setCompact(false);
                              showToast("Customization reset", "success");
                            }}
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="accordion-item border-0 mt-2">
                    <h2 className="accordion-header" id="headingPaper">
                      <button className="accordion-button collapsed fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#collapsePaper">
                        Paper & Tips
                      </button>
                    </h2>
                    <div id="collapsePaper" className="accordion-collapse collapse" data-bs-parent="#resumeTemplateAccordion">
                      <div className="accordion-body">
                        <label className="form-label small fw-bold text-muted">Paper Size (UI)</label>
                        <select className="form-select" value={paper} onChange={(e) => setPaper(e.target.value)}>
                          <option value="a4">A4 (Recommended)</option>
                          <option value="letter">US Letter</option>
                        </select>
                        <div className="small text-muted mt-3">
                          Tip: Update your <b>Profile</b> (bio, skills, experience, education) to auto-fill the resume.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden" style={{ backgroundColor: COLORS.card }}>
              <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
                <div className="fw-bold">Live Preview</div>
                <div className="small text-muted">Template: {templateKey.toUpperCase()} • Paper: {paper.toUpperCase()}</div>
              </div>

              <div className="p-3" style={{ background: "#eef2f6" }}>
                <div
                  className="mx-auto"
                  style={{
                    width: paper === "letter" ? 816 : 794, // px-like preview width (approx)
                    background: "#fff",
                    borderRadius: 16,
                    overflow: "hidden",
                    boxShadow: "0 10px 30px rgba(2,6,23,0.10)",
                    border: `1px solid ${COLORS.border}`,
                    fontFamily: options.fontFamily,
                  }}
                >
                  <div ref={previewRef}>
                    <ResumeTemplateRenderer templateKey={templateKey} resume={resume} options={options} />
                  </div>
                </div>
                <div className="text-muted small mt-2">
                  Download uses a screenshot-to-PDF method; the PDF will look like this preview.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


