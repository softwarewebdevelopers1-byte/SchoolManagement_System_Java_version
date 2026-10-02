import type { ReactNode } from "react";
import { Box, Card, Stack, Typography } from "@mui/material";
import { analyticsColors, analyticsTypography } from "../../../lib/analyticsTheme";

export type KpiDeltaDirection = "up" | "down" | "neutral";

export interface KpiDelta {
  direction: KpiDeltaDirection;
  value: ReactNode;
  label?: string;
}

export interface KpiCardProps {
  label: ReactNode;
  value: ReactNode;
  unit?: ReactNode;
  delta?: KpiDelta;
  sparkline?: number[];
  icon?: ReactNode;
}

const deltaColors: Record<KpiDeltaDirection, string> = {
  up: analyticsColors.success,
  down: analyticsColors.danger,
  neutral: analyticsColors.neutral.text,
};

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 28 - ((value - min) / range) * 24;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <Box
      component="svg"
      viewBox="0 0 100 32"
      role="img"
      aria-label="KPI trend"
      sx={{ width: 76, height: 28, color: analyticsColors.secondary }}
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Box>
  );
}

export function KpiCard({ label, value, unit, delta, sparkline, icon }: KpiCardProps) {
  const deltaColor = delta ? deltaColors[delta.direction] : undefined;
  const deltaArrow = delta?.direction === "up" ? "↑" : delta?.direction === "down" ? "↓" : "→";

  return (
    <Card
      variant="outlined"
      sx={{
        borderColor: analyticsColors.neutral.border,
        borderRadius: 3,
        p: 2.5,
        boxShadow: "0 2px 8px rgba(16, 24, 40, 0.05)",
      }}
    >
      <Stack
        direction="row"
        sx={{ justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography component="div" sx={analyticsTypography.kpiLabel}>
            {label}
          </Typography>
          <Stack direction="row" sx={{ alignItems: "baseline", gap: 0.75, mt: 1 }}>
            <Typography component="div" sx={analyticsTypography.kpiNumber}>
              {value}
            </Typography>
            {unit && (
              <Typography variant="body2" color="text.secondary">
                {unit}
              </Typography>
            )}
          </Stack>
          {delta && (
            <Stack
              component="div"
              direction="row"
              sx={{ alignItems: "center", gap: 0.5, mt: 1, color: deltaColor }}
              aria-label={`${delta.direction} change`}
            >
              <Box component="span" aria-hidden="true" sx={{ fontWeight: 700 }}>
                {deltaArrow}
              </Box>
              <Typography component="span" variant="caption" sx={{ color: "inherit", fontWeight: 600 }}>
                {delta.value}
              </Typography>
              {delta.label && (
                <Typography component="span" variant="caption" color="text.secondary">
                  {delta.label}
                </Typography>
              )}
            </Stack>
          )}
        </Box>
        <Stack sx={{ alignItems: "flex-end", gap: 1 }}>
          {icon}
          {sparkline && <Sparkline values={sparkline} />}
        </Stack>
      </Stack>
    </Card>
  );
}

export default KpiCard;
