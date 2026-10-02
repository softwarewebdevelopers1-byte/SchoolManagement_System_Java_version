import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationContainer } from "./NotificationContainer";
import {
  useNotifications,
} from "./NotificationContext";
import { NotificationProvider } from "./NotificationProvider";

const NotificationTestControls = () => {
  const toast = useNotifications();
  return (
    <div>
      <button onClick={() => toast.success("Saved successfully.")}>Success</button>
      <button onClick={() => toast.error("Unable to save.")}>Error</button>
      <button onClick={() => toast.info("Temporary message.", { duration: 0 })}>
        Zero-duration option
      </button>
      <button onClick={() => {
        toast.info("Duplicate message.");
        toast.info("Duplicate message.");
      }}>Duplicate</button>
      <button onClick={() => {
        for (let index = 0; index < 6; index += 1) {
          toast.info(`Notification ${index}`);
        }
      }}>Stack</button>
    </div>
  );
};

const renderNotifications = () => render(
  <NotificationProvider>
    <NotificationTestControls />
    <NotificationContainer />
  </NotificationProvider>,
);

describe("global notifications", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("shows accessible variants and auto-dismisses after the configured duration", () => {
    renderNotifications();
    fireEvent.click(screen.getByRole("button", { name: "Success" }));
    expect(screen.getByRole("status").textContent).toContain("Saved successfully.");

    act(() => vi.advanceTimersByTime(3999));
    expect(screen.getByRole("status")).toBeTruthy();

    act(() => vi.advanceTimersByTime(181));
    expect(screen.queryByRole("status")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Error" }));
    expect(screen.getByRole("alert").textContent).toContain("Unable to save.");
  });

  it("supports manual close and suppresses rapid duplicate messages", () => {
    renderNotifications();
    fireEvent.click(screen.getByRole("button", { name: "Duplicate" }));
    expect(screen.getAllByRole("status")).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: "Dismiss notification" }));
    act(() => vi.advanceTimersByTime(180));
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("uses the default auto-dismiss duration for a non-positive custom duration", () => {
    renderNotifications();
    fireEvent.click(screen.getByRole("button", { name: "Zero-duration option" }));
    expect(screen.getByRole("status")).toBeTruthy();

    act(() => vi.advanceTimersByTime(4180));
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("keeps only the five newest notifications", () => {
    renderNotifications();
    fireEvent.click(screen.getByRole("button", { name: "Stack" }));
    expect(screen.getAllByRole("status")).toHaveLength(5);
    expect(screen.queryByText("Notification 0")).toBeNull();
    expect(screen.getByText("Notification 5")).toBeTruthy();
  });

  it("pauses the auto-dismiss timer while hovered", () => {
    renderNotifications();
    fireEvent.click(screen.getByRole("button", { name: "Success" }));
    const notification = screen.getByRole("status");
    act(() => vi.advanceTimersByTime(2000));
    fireEvent.mouseEnter(notification);
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.getByRole("status")).toBeTruthy();

    fireEvent.mouseLeave(notification);
    act(() => vi.advanceTimersByTime(2180));
    expect(screen.queryByRole("status")).toBeNull();
  });
});
