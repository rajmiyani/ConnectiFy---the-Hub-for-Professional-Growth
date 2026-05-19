import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";
import { FaDownload, FaRobot } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";

/* ================== THEME ================== */
const COLORS = {
  primary: "#0073b1",
  secondary: "#e8f4fb",
  bg: "#f3f2ef",
  white: "#ffffff",
  textDark: "#1f1f1f",
  textLight: "#606770",
  success: "#137333",
  danger: "#b3261e",
};

/* ================== DATA ================== */
// Initial state placeholders
const initialKpis = [
  { label: "Total Applicants", value: "0", trend: "0%" },
  { label: "Shortlisted", value: "0", trend: "0%" },
  { label: "Interviews", value: "0", trend: "0%" },
  { label: "Hires", value: "0", trend: "0%" },
];

/* ================== TIME FILTER ================== */
const TimeFilter = ({ active, setActive }) => {
  const options = [
    { label: "7 Days", value: "7" },
    { label: "30 Days", value: "30" },
    { label: "90 Days", value: "90" },
  ];
  return (
    <div
      className="d-flex align-items-center"
      style={{
        background: COLORS.white,
        border: "1px solid #e5e9f2",
        borderRadius: 30,
        padding: 4,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setActive(opt.value)}
          className="btn btn-sm"
          style={{
            background:
              active === opt.value ? COLORS.primary : "transparent",
            color:
              active === opt.value ? COLORS.white : COLORS.textLight,
            fontWeight: 600,
            borderRadius: 25,
            padding: "6px 18px",
            border: "none",
            transition: "all 0.25s ease",
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

/* ================== MAIN COMPONENT ================== */
export default function CompanyAnalytics() {
  const { user } = useAuth();
  const [range, setRange] = useState("30");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    kpis: initialKpis,
    growthData: [],
    jobPerformance: [],
    funnelData: [],
    sourceData: []
  });

  const fetchAnalytics = async () => {
    const companyId = user?.id || user?.company?.id;
    if (!companyId) return;

    setLoading(true);
    try {
      const res = await api.get(`/companies/analytics/${companyId}?range=${range}`);
      const json = res.data;
      if (json.success) {
        setData(json.data);
      }
    } catch (error) {
      console.error("Analytics fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAnalytics();
  }, [user?.id, user?.company?.id, range]);

  const exportCSV = () => {
    console.log("CSV export triggered");
    alert("CSV Export Ready (Backend hookup pending)");
  };

  const exportPDF = () => {
    console.log("PDF export triggered");
    alert("PDF Export Ready (Use html2pdf / backend)");
  };

  const Card = ({ children }) => (
    <div
      className="bg-white rounded-4 shadow-sm p-4 h-100"
      style={{ border: "1px solid #eef1f4" }}
    >
      {children}
    </div>
  );

  const SectionHeader = ({ title, subtitle, right }) => (
    <div className="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h6 className="fw-bold mb-0">{title}</h6>
        {subtitle && <small className="text-muted">{subtitle}</small>}
      </div>
      {right}
    </div>
  );

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", padding: 32 }}>
      {/* ===== HEADER ===== */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Analytics</h4>
          <small className="text-muted">
            Real-time hiring performance & conversion insights
          </small>
        </div>
        <TimeFilter active={range} setActive={setRange} />
      </div>

      {/* ===== KPI CARDS ===== */}
      <div className="row g-4 mb-4">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="col-md-3">
              <div className="skeleton skeleton-pulse p-4 rounded-4" style={{ height: 110 }}></div>
            </div>
          ))
        ) : (
          data.kpis.map((kpi, i) => (
            <div key={i} className="col-md-3">
              <div
                className="rounded-4 p-4 h-100"
                style={{
                  background: "linear-gradient(135deg,#ffffff,#f8fbfd)",
                  border: "1px solid #eef1f4",
                }}
              >
                <small className="text-muted fw-semibold">{kpi.label}</small>
                <div className="d-flex justify-content-between align-items-end mt-2">
                  <h4 className="fw-bold mb-0">{kpi.value}</h4>
                  <span
                    className={`fw-semibold ${kpi.trend.includes("-") ? "text-danger" : "text-success"
                      }`}
                  >
                    {kpi.trend}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ===== ROW 1 ===== */}
      <div className="row g-4">
        {/* Applicant Growth */}
        <div className="col-md-7">
          <Card>
            <SectionHeader
              title="Applicant Growth Trend"
              subtitle="Month-over-month applicant inflow"
              right={<span className="text-success fw-semibold">▲ 18%</span>}
            />

            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={data.growthData}>
                <defs>
                  <linearGradient id="growth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.45} />
                    <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="applicants"
                  stroke={COLORS.primary}
                  strokeWidth={3}
                  fill="url(#growth)"
                />
              </AreaChart>
            </ResponsiveContainer>

            <small className="text-muted">
              Strong upward trend driven by LinkedIn & referrals
            </small>
          </Card>
        </div>

        {/* Hiring Source */}
        <div className="col-md-5">
          <Card>
            <SectionHeader
              title="Hiring Source Distribution"
              subtitle="Source-wise applicant volume"
            />

            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={data.sourceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="source" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="value"
                  fill={COLORS.primary}
                  radius={[10, 10, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>

            <small className="text-muted">
              Referrals show highest quality-to-hire ratio
            </small>
          </Card>
        </div>
      </div>

      {/* ===== ROW 2 ===== */}
      <div className="row g-4 mt-1">
        {/* Job Performance */}
        <div className="col-md-6">
          <Card>
            <SectionHeader
              title="Top Performing Job Roles"
              subtitle="Applicants vs conversion efficiency"
            />

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.jobPerformance} layout="vertical">
                <XAxis type="number" />
                <YAxis dataKey="role" type="category" width={120} />
                <Tooltip />
                <Bar
                  dataKey="applicants"
                  fill={COLORS.primary}
                  radius={[0, 10, 10, 0]}
                />
              </BarChart>
            </ResponsiveContainer>

            <small className="text-muted">
              Frontend roles convert 2× faster than average
            </small>
          </Card>
        </div>

        {/* Funnel */}
        <div className="col-md-6">
          <Card>
            <SectionHeader
              title="Hiring Funnel Analysis"
              subtitle="Conversion & drop-off visibility"
            />

            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={data.funnelData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="stage" />
                <Radar
                  dataKey="value"
                  fill={COLORS.primary}
                  fillOpacity={0.35}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>

            <small className="text-danger">
              Interview → Offer stage needs optimization
            </small>
          </Card>
        </div>
      </div>

      {/* ===== AI INSIGHTS ===== */}
      <Card className="mt-5">
        <SectionHeader
          title={
            <>
              <FaRobot className="me-2" />
              AI Hiring Recommendations
            </>
          }
          subtitle="System-generated optimization insights"
        />

        <ul className="mb-0 small">
          <li>Reduce interview turnaround time by 2 days</li>
          <li>Increase backend salary band to improve offer acceptance</li>
          <li>Allocate more budget to referral programs</li>
          <li>Frontend roles deliver highest ROI</li>
        </ul>
      </Card>

      {/* ===== EXPORT ===== */}
      <div className="d-flex justify-content-end gap-3 mt-4">
        <button
          onClick={exportCSV}
          className="btn btn-sm d-flex align-items-center gap-2"
          style={{
            background: COLORS.secondary,
            color: COLORS.primary,
            border: `1px solid ${COLORS.primary}`,
            fontWeight: 600,
            padding: "8px 14px",
            borderRadius: 8,
          }}
        >
          <FaDownload size={14} />
          Export CSV
        </button>

        <button
          onClick={exportPDF}
          className="btn btn-sm d-flex align-items-center gap-2"
          style={{
            background: COLORS.primary,
            color: COLORS.white,
            border: `1px solid ${COLORS.primary}`,
            fontWeight: 600,
            padding: "8px 14px",
            borderRadius: 8,
          }}
        >
          <FaDownload size={14} />
          Export PDF
        </button>
      </div>
    </div>
  );
}
