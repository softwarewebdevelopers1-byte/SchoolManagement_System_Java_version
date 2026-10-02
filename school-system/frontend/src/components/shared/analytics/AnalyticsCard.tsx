import type { ReactNode } from "react";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
  type CardProps,
} from "@mui/material";
import { analyticsColors, analyticsTypography } from "../../../lib/analyticsTheme";

export interface AnalyticsCardProps extends Omit<CardProps, "title"> {
  title?: ReactNode;
  subtitle?: ReactNode;
  filter?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
}

export function AnalyticsCard({
  title,
  subtitle,
  filter,
  actions,
  footer,
  children,
  sx,
  ...cardProps
}: AnalyticsCardProps) {
  const hasHeader = title || subtitle || filter || actions;

  return (
    <Card
      variant="outlined"
      {...cardProps}
      sx={[
        {
          borderColor: analyticsColors.neutral.border,
          borderRadius: 3,
          boxShadow: "0 2px 8px rgba(16, 24, 40, 0.05)",
          overflow: "hidden",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {hasHeader && (
        <>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            sx={{
              alignItems: { xs: "stretch", sm: "center" },
              justifyContent: "space-between",
              gap: 2,
              px: 2.5,
              py: 2,
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              {title && (
                <Typography component="h2" sx={analyticsTypography.chartTitle}>
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: title ? 0.5 : 0 }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
            {(filter || actions) && (
              <Stack
                direction="row"
                sx={{
                  alignItems: "center",
                  justifyContent: "flex-end",
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                {filter}
                {actions}
              </Stack>
            )}
          </Stack>
          <Divider />
        </>
      )}
      {children != null && <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>{children}</CardContent>}
      {footer != null && (
        <>
          <Divider />
          <Box sx={{ px: 2.5, py: 1.5 }}>{footer}</Box>
        </>
      )}
    </Card>
  );
}

export default AnalyticsCard;
