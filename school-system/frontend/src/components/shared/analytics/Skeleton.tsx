import { Box, Skeleton as MuiSkeleton, Stack } from "@mui/material";

export interface ChartSkeletonProps {
  height?: number;
}

export function ChartSkeleton({ height = 280 }: ChartSkeletonProps) {
  return (
    <Stack role="status" aria-label="Loading chart" spacing={1} sx={{ width: "100%" }}>
      <MuiSkeleton variant="rounded" height={height} />
    </Stack>
  );
}

export interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 5 }: TableSkeletonProps) {
  return (
    <Box role="status" aria-label="Loading table" sx={{ width: "100%" }}>
      <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
        {Array.from({ length: columns }, (_, index) => (
          <MuiSkeleton key={`header-${index}`} variant="rounded" height={32} sx={{ flex: 1 }} />
        ))}
      </Stack>
      {Array.from({ length: rows }, (_, rowIndex) => (
        <Stack key={rowIndex} direction="row" spacing={1} sx={{ mb: 1 }}>
          {Array.from({ length: columns }, (_, columnIndex) => (
            <MuiSkeleton
              key={`${rowIndex}-${columnIndex}`}
              variant="rounded"
              height={28}
              sx={{ flex: 1 }}
            />
          ))}
        </Stack>
      ))}
    </Box>
  );
}

export const Skeleton = MuiSkeleton;

