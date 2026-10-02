import type { ReactNode } from "react";
import { Alert, Button, Stack } from "@mui/material";

export interface ErrorStateProps {
  message?: ReactNode;
  retryLabel?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = "Unable to load analytics.",
  retryLabel = "Retry",
  onRetry,
}: ErrorStateProps) {
  return (
    <Stack role="alert" spacing={1.5} sx={{ alignItems: "center", py: 3 }}>
      <Alert severity="error">{message}</Alert>
      {onRetry && (
        <Button variant="outlined" color="error" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </Stack>
  );
}

export default ErrorState;
