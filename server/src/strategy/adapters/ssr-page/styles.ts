import type React from "react";

export function formatRub(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);
}

export const pageShellStyle: React.CSSProperties = {
  fontFamily: "system-ui",
  padding: 24,
  maxWidth: 1220,
  margin: "0 auto",
  background: "#f8fafc",
};

export const heroStyle: React.CSSProperties = {
  padding: 28,
  borderRadius: 24,
  background:
    "linear-gradient(135deg, rgba(0,94,255,0.96), rgba(130,60,255,0.88))",
  color: "#ffffff",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 20,
  marginBottom: 20,
};

export const heroEyebrowStyle: React.CSSProperties = {
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: 1.2,
  color: "rgba(255,255,255,0.74)",
};

export const heroTitleStyle: React.CSSProperties = {
  margin: "8px 0 12px",
  fontSize: 40,
  lineHeight: 1.05,
};

export const heroTextStyle: React.CSSProperties = {
  margin: 0,
  maxWidth: 720,
  color: "rgba(255,255,255,0.92)",
  lineHeight: 1.6,
};

export const heroPromoStyle: React.CSSProperties = {
  padding: 18,
  borderRadius: 18,
  background: "rgba(255,255,255,0.14)",
  border: "1px solid rgba(255,255,255,0.2)",
  alignSelf: "start",
};

export const contentSectionStyle: React.CSSProperties = {
  padding: 24,
  borderRadius: 20,
  border: "1px solid #dbe3ef",
  background: "#ffffff",
};

export const toolbarStyle: React.CSSProperties = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
  alignItems: "center",
  marginBottom: 18,
};

export const productCardStyle: React.CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: 18,
  padding: 14,
  background: "#ffffff",
  boxShadow: "0 10px 24px rgba(15,23,42,0.05)",
};

export const productImageWrapStyle: React.CSSProperties = {
  position: "relative",
  background: "#f8fafc",
  borderRadius: 16,
  overflow: "hidden",
};

export const productImageStyle: React.CSSProperties = {
  width: "100%",
  height: 180,
  objectFit: "cover",
  display: "block",
};

export const badgeStyle: React.CSSProperties = {
  position: "absolute",
  top: 10,
  left: 10,
  zIndex: 1,
  background: "#2563eb",
  color: "#ffffff",
  fontSize: 12,
  fontWeight: 700,
  borderRadius: 999,
  padding: "6px 10px",
};

export const checkoutPanelStyle: React.CSSProperties = {
  border: "1px solid #dbe3ef",
  borderRadius: 20,
  padding: 18,
  background: "#f8fafc",
  position: "sticky",
  top: 20,
};

export const emptyStateStyle: React.CSSProperties = {
  padding: 14,
  borderRadius: 12,
  background: "#ffffff",
  color: "#64748b",
};

export const statusNoteStyle: React.CSSProperties = {
  marginTop: 14,
  padding: 12,
  borderRadius: 12,
  background: "#eff6ff",
  color: "#1d4ed8",
};

export const statCardStyle: React.CSSProperties = {
  padding: 18,
  borderRadius: 16,
  background: "#eef6ff",
  border: "1px solid #c7def8",
};

export const reportLayoutStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.8fr) minmax(280px, 1fr)",
  gap: 18,
  alignItems: "start",
};

export const reportPanelStyle: React.CSSProperties = {
  padding: 18,
  borderRadius: 18,
  border: "1px solid #e2e8f0",
  background: "#ffffff",
};

export const reportPanelHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "start",
  flexWrap: "wrap",
};

export const pillAlertStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "6px 10px",
  borderRadius: 999,
  background: "#fef2f2",
  color: "#b91c1c",
  fontSize: 12,
  fontWeight: 700,
};

export const sectionEyebrowStyle: React.CSSProperties = {
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: 1.1,
  color: "#64748b",
};

export const insightGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: 12,
  marginTop: 16,
};

export const insightCardStyle: React.CSSProperties = {
  padding: 14,
  borderRadius: 14,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
};

export const insightLabelStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#64748b",
  marginBottom: 6,
};

export const chartGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
  marginTop: 18,
};

export const chartCardStyle: React.CSSProperties = {
  padding: 16,
  borderRadius: 16,
  background: "#f8fafc",
  border: "1px solid #dbe3ef",
};

export const chartTitleStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#475569",
  marginBottom: 10,
};

export const chartSvgStyle: React.CSSProperties = {
  width: "100%",
  height: 92,
  display: "block",
};

export const chartFooterStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 8,
  marginTop: 8,
  fontSize: 12,
  color: "#64748b",
};

export const channelMixGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
  marginTop: 18,
};

export const channelCardStyle: React.CSSProperties = {
  padding: 16,
  borderRadius: 16,
  background: "#ffffff",
  border: "1px solid #dbe3ef",
};

export const channelTrackStyle: React.CSSProperties = {
  marginTop: 10,
  height: 10,
  borderRadius: 999,
  background: "#e2e8f0",
  overflow: "hidden",
};

export const hourlyLoadStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(8, minmax(0, 1fr))",
  gap: 10,
  alignItems: "end",
  minHeight: 180,
  marginTop: 18,
};

export const hourlyLoadColumnStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
  justifyItems: "center",
};

export const hourlyLoadBarWrapStyle: React.CSSProperties = {
  width: "100%",
  height: 140,
  display: "flex",
  alignItems: "end",
  justifyContent: "center",
  background: "linear-gradient(180deg, #f8fafc 0%, #eff6ff 100%)",
  borderRadius: 14,
  border: "1px solid #dbe3ef",
  padding: "10px 8px",
  boxSizing: "border-box",
};

export const hourlyLoadBarStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 34,
  borderRadius: 999,
  background: "linear-gradient(180deg, #2563eb 0%, #60a5fa 100%)",
};

export const segmentsTableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: 18,
  fontSize: 14,
};

export const segmentCellStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderBottom: "1px solid #e2e8f0",
  textAlign: "left",
};

export const queueGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
  marginTop: 18,
};

export const queueCardStyle: React.CSSProperties = {
  padding: 16,
  borderRadius: 16,
  background: "#f8fafc",
  border: "1px solid #dbe3ef",
};

export const sidePanelStyle: React.CSSProperties = {
  padding: 18,
  borderRadius: 18,
  background: "#f8fafc",
  border: "1px solid #dbe3ef",
};

export const detailCardStyle: React.CSSProperties = {
  marginTop: 14,
  padding: 14,
  borderRadius: 14,
  background: "#ffffff",
  border: "1px solid #dbe3ef",
};

export const alertCardStyle: React.CSSProperties = {
  padding: 14,
  borderRadius: 14,
  background: "#ffffff",
  border: "1px solid #dbe3ef",
  marginTop: 12,
};

export const alertPillHighStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 8px",
  borderRadius: 999,
  background: "#fef2f2",
  color: "#b91c1c",
  fontSize: 12,
  fontWeight: 700,
};

export const alertPillMediumStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 8px",
  borderRadius: 999,
  background: "#fff7ed",
  color: "#c2410c",
  fontSize: 12,
  fontWeight: 700,
};

export const successNoteStyle: React.CSSProperties = {
  marginTop: 14,
  padding: 12,
  borderRadius: 12,
  background: "#ecfdf3",
  color: "#166534",
};

export const articleCardStyle: React.CSSProperties = {
  padding: 18,
  borderRadius: 18,
  border: "1px solid #e2e8f0",
  background: "#ffffff",
};

export const articleLeadStyle: React.CSSProperties = {
  fontSize: 20,
  lineHeight: 1.5,
  color: "#0f172a",
};

export const articleTextStyle: React.CSSProperties = {
  color: "#334155",
  lineHeight: 1.8,
};

export const orderedListStyle: React.CSSProperties = {
  margin: 0,
  paddingLeft: 20,
  color: "#334155",
  lineHeight: 1.8,
};

export const listStyle: React.CSSProperties = {
  margin: "8px 0 0",
  paddingLeft: 20,
  color: "#334155",
  lineHeight: 1.8,
};
