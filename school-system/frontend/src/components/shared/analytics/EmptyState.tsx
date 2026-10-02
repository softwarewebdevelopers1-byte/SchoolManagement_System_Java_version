import type { ReactNode } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { analyticsColors } from "../../../lib/analyticsTheme";

export interface EmptyStateProps {
  title?: ReactNode;
  description?: ReactNode;
}

export function EmptyState({
  title = "No data available",
  description = "There is no data to display for this view.",
}: EmptyStateProps) {
  return (
    <Stack
      role="status"
      spacing={1}
      sx={{
        alignItems: "center",
        justifyContent: "center",
        minHeight: 180,
        py: 3,
        textAlign: "center",
      }}
    >
      <Box
        component="svg"
        viewBox="0 0 48 48"
        aria-hidden="true"
        sx={{ width: 44, height: 44, color: analyticsColors.neutral.text }}
      >
        <rect x="7" y="8" width="34" height="32" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M14 32v-8m10 8V15m10 17v-12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </Box>
      <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Stack>
  );
}

export default EmptyState;
