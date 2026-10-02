import React, { useCallback } from "react";
import { useNotifications } from "./NotificationContext";

type BoundaryProps = {
  children: React.ReactNode;
  onError: () => void;
};

type BoundaryState = { failed: boolean };

class Boundary extends React.Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false };

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }

  componentDidCatch(): void {
    this.props.onError();
  }

  render() {
    if (this.state.failed) {
      return (
        <main role="alert" style={{ padding: 24, textAlign: "center" }}>
          Something went wrong. Please refresh the page and try again.
        </main>
      );
    }
    return this.props.children;
  }
}

export const NotificationErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const toast = useNotifications();
  const onError = useCallback(
    () => toast.error("Something went wrong. Please try again."),
    [toast],
  );

  return <Boundary onError={onError}>{children}</Boundary>;
};
