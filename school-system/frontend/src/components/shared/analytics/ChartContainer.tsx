import type { ReactElement, ReactNode } from "react";
import { Box } from "@mui/material";
import { ResponsiveContainer } from "recharts";
import { AnalyticsCard } from "./AnalyticsCard";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { ChartSkeleton } from "./Skeleton";

export interface ChartContainerProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  height?: number;
  loading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: ReactNode;
  error?: ReactNode;
  onRetry?: () => void;
  children: ReactElement;
}

export function ChartContainer({
  title,
  subtitle,
  actions,
  height = 280,
  loading = false,
  isEmpty = false,
  emptyMessage,
  error,
  onRetry,
  children,
}: ChartContainerProps) {
  let content: ReactNode;

  if (error) {
    content = <ErrorState message={error} onRetry={onRetry} />;
  } else if (loading) {
    content = <ChartSkeleton height={height} />;
  } else if (isEmpty) {
    content = <EmptyState description={emptyMessage} />;
  } else {
    content = (
      <Box sx={{ width: "100%", height }}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </Box>
    );
  }

  return (
    <AnalyticsCard title={title} subtitle={subtitle} actions={actions}>
      {content}
    </AnalyticsCard>
  );
}

export default ChartContainer;
