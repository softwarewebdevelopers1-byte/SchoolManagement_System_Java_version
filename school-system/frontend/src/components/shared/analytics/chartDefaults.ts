import { createElement } from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";
import type {
  CartesianGridProps,
  LegendProps,
  TooltipContentProps,
  TooltipValueType,
  XAxisProps,
  YAxisProps,
} from "recharts";
import { analyticsChartDefaults, analyticsColors } from "../../../lib/analyticsTheme";

export const analyticsGridProps: CartesianGridProps = {
  ...analyticsChartDefaults.grid,
};

export const analyticsXAxisProps: XAxisProps = {
  axisLine: false,
  tickLine: false,
  tick: {
    fontSize: 11,
    fill: analyticsColors.neutral.text,
  },
  padding: {
    left: analyticsChartDefaults.axis.padding.left,
    right: analyticsChartDefaults.axis.padding.right,
  },
};

export const analyticsYAxisProps: YAxisProps = {
  axisLine: false,
  tickLine: false,
  tick: {
    fontSize: 11,
    fill: analyticsColors.neutral.text,
  },
  padding: { top: 8, bottom: 8 },
};

export const analyticsLegendProps: LegendProps = {
  verticalAlign: analyticsChartDefaults.legend.verticalAlign,
  align: analyticsChartDefaults.legend.align,
  iconType: analyticsChartDefaults.legend.iconType,
  wrapperStyle: {
    color: analyticsColors.neutral.text,
    fontSize: 12,
  },
};

export function formatTooltipValue(value: TooltipValueType, unit?: string): string {
  const formatted = Array.isArray(value)
    ? value.map((part) => String(part)).join(", ")
    : typeof value === "number"
      ? new Intl.NumberFormat().format(value)
      : String(value);
  return unit ? `${formatted}${unit}` : formatted;
}

export function AnalyticsTooltip({
  active,
  payload,
  label,
}: TooltipContentProps) {
  if (!active || !payload?.length) return null;

  return createElement(
    Paper,
    {
      elevation: 4,
      sx: {
        border: `1px solid ${analyticsColors.neutral.border}`,
        borderRadius: 2,
        px: 1.5,
        py: 1,
      },
    },
    label != null
      ? createElement(
          Typography,
          {
            variant: "caption",
            sx: { display: "block", mb: 0.5, fontWeight: 700 },
          },
          label,
        )
      : null,
    createElement(
      Stack,
      { spacing: 0.25 },
      ...payload.map((entry, index) => {
        const name = entry.name == null ? "" : String(entry.name);
        const color = entry.color || analyticsColors.primary;
        const unit = entry.unit == null ? undefined : String(entry.unit);
        return createElement(
          Stack,
          {
            key: `${name}-${index}`,
            direction: "row",
            sx: { alignItems: "center", justifyContent: "space-between", gap: 2 },
          },
          createElement(
            Stack,
            { direction: "row", sx: { alignItems: "center", gap: 0.75 } },
            createElement(Box, {
              "aria-hidden": true,
              sx: { width: 8, height: 8, borderRadius: "50%", bgcolor: color },
            }),
            createElement(
              Typography,
              { variant: "caption", color: "text.secondary" },
              name,
            ),
          ),
          createElement(
            Typography,
            { variant: "caption", sx: { fontWeight: 600 } },
            formatTooltipValue(entry.value ?? "", unit),
          ),
        );
      }),
    ),
  );
}

export const analyticsTooltipProps = {
  content: (props: TooltipContentProps) => createElement(AnalyticsTooltip, props),
  cursor: { fill: "rgba(22, 51, 37, 0.06)" },
} as const;
