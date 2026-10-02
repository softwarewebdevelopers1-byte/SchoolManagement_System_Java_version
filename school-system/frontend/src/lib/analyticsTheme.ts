import type { CSSProperties } from "react";

export const analyticsColors = {
  primary: "#163325",
  secondary: "#185FA5",
  accent: "#7A5200",
  danger: "#B42318",
  success: "#1D6A3A",
  warning: "#854F0B",
  qualitative: [
    "#163325",
    "#185FA5",
    "#6B3FA0",
    "#9A4D00",
    "#007A78",
    "#B42318",
    "#7A5200",
    "#4A5568",
  ],
  sequential: [
    "#F2F7F4",
    "#DCEBE2",
    "#B7D2C1",
    "#80AD92",
    "#4C805F",
    "#2F5F42",
    "#163325",
  ],
  neutral: {
    axis: "#475467",
    grid: "#E4E7EC",
    border: "#D0D5DD",
    text: "#667085",
    surface: "#FFFFFF",
    foreground: "#344054",
  },
} as const;

export const analyticsTypography = {
  chartTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: analyticsColors.primary,
  },
  axisLabel: {
    fontSize: 11,
    fontWeight: 400,
    color: analyticsColors.neutral.text,
  },
  dataLabel: {
    fontSize: 12,
    fontWeight: 500,
    color: analyticsColors.neutral.foreground,
  },
  kpiNumber: {
    fontSize: 28,
    fontWeight: 700,
    color: analyticsColors.primary,
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: analyticsColors.neutral.text,
  },
} as const satisfies Record<string, CSSProperties>;

export const analyticsChartDefaults = {
  grid: {
    stroke: analyticsColors.neutral.grid,
    strokeDasharray: "2 4",
    horizontal: true,
    vertical: false,
  },
  axis: {
    axisLine: false,
    tickLine: false,
    tick: {
      fontSize: analyticsTypography.axisLabel.fontSize,
      fill: analyticsTypography.axisLabel.color,
    },
    padding: { left: 12, right: 12 },
  },
  tooltip: {
    background: analyticsColors.neutral.surface,
    border: analyticsColors.neutral.border,
    borderRadius: 10,
    fontSize: 12,
  },
  legend: {
    verticalAlign: "top",
    align: "right",
    iconType: "circle",
  },
  bar: {
    radius: 4,
  },
  line: {
    strokeWidth: 2.25,
  },
  area: {
    fillOpacity: 0.16,
  },
  margin: {
    top: 12,
    right: 16,
    bottom: 8,
    left: 4,
  },
} as const;

