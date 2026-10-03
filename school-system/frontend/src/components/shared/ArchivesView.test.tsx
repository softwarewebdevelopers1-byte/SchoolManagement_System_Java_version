import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ArchivesView } from "./ArchivesView";
import { NotificationContainer } from "./notifications/NotificationContainer";
import { NotificationProvider } from "./notifications/NotificationProvider";
import { api, downloadApiFile, getSchoolId, openApiFile } from "../../lib/api";

vi.mock("../../lib/api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
  downloadApiFile: vi.fn(),
  openApiFile: vi.fn(),
  getSchoolId: vi.fn(() => null),
}));

const attendanceArchive = {
  id: "archive-123",
  type: "ATTENDANCE" as const,
  classId: "class-1",
  className: "1 North",
  academicYear: null,
  term: null,
  examType: null,
  startDate: "2026-10-02",
  endDate: "2026-10-03",
  version: 1,
  status: "VERIFIED" as const,
  requestedAt: "2026-10-03T08:00:00Z",
  verifiedAt: "2026-10-03T08:05:00Z",
  documentSize: 1024,
  cleanupEligible: false,
  lastError: null,
  correctionReason: null,
  schoolName: "Greenhill Academy",
  studentCount: 3,
  recordedDays: 1,
  noSheetDays: 1,
  attendanceRate: 100,
};

const resultArchive = {
  ...attendanceArchive,
  id: "result-archive-8",
  type: "RESULT" as const,
  academicYear: "2026",
  term: 2,
  examType: "END_TERM",
  startDate: null,
  endDate: null,
  schoolName: null,
  studentCount: 42,
  recordedDays: null,
  noSheetDays: null,
  attendanceRate: null,
};

const renderArchives = () => render(
  <NotificationProvider>
    <ArchivesView />
    <NotificationContainer />
  </NotificationProvider>,
);

describe("attendance archive actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.get).mockResolvedValue({
      content: [attendanceArchive],
      page: 0,
      size: 50,
      hasNext: false,
    });
    vi.mocked(downloadApiFile).mockResolvedValue(undefined);
    vi.mocked(openApiFile).mockResolvedValue(undefined);
  });

  it("shows recorded and no-sheet days separately and groups technical artifacts under More", async () => {
    renderArchives();
    expect(await screen.findByText("Greenhill Academy")).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
    expect(screen.getByText("Recorded days").parentElement?.textContent).toContain("1");
    expect(screen.getByText("No-sheet days").parentElement?.textContent).toContain("1");
    expect(screen.getByText("Attendance rate")).toBeTruthy();
    expect(screen.getByText("Oct 02, 2026 – Oct 03, 2026")).toBeTruthy();
    expect(screen.getByText("More").parentElement?.hasAttribute("open")).toBe(false);
    fireEvent.click(screen.getByText("More"));
    expect(screen.getByRole("button", { name: "Download Data Snapshot" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Download Archive Manifest" })).toBeTruthy();
  });

  it("calls authenticated report and artifact endpoints and confirms successful downloads", async () => {
    renderArchives();
    await screen.findByText("Greenhill Academy");

    fireEvent.click(screen.getByRole("button", { name: "View Report" }));
    await waitFor(() => expect(openApiFile).toHaveBeenCalledWith(
      "/school/attendance-archives/archive-123/pdf?disposition=inline",
      "attendance-report.pdf",
    ));
    expect(await screen.findByText("Attendance report opened.")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Download PDF" }));
    await waitFor(() => expect(downloadApiFile).toHaveBeenCalledWith(
      "/school/attendance-archives/archive-123/pdf",
    ));
    expect(await screen.findByText("Download started.")).toBeTruthy();

    fireEvent.click(screen.getByText("More"));
    fireEvent.click(screen.getByRole("button", { name: "Download Data Snapshot" }));
    await waitFor(() => expect(downloadApiFile).toHaveBeenCalledWith(
      "/school/attendance-archives/archive-123/snapshot",
    ));
    await waitFor(() => expect(downloadApiFile).toHaveBeenCalledTimes(2));
    fireEvent.click(screen.getByRole("button", { name: "Download Archive Manifest" }));
    await waitFor(() => expect(downloadApiFile).toHaveBeenCalledWith(
      "/school/attendance-archives/archive-123/manifest",
    ));
    await waitFor(() => expect(downloadApiFile).toHaveBeenCalledTimes(3));
    expect(downloadApiFile).toHaveBeenCalledTimes(3);
  });

  it("disables duplicate download requests and displays a visible failure", async () => {
    let resolveDownload!: () => void;
    vi.mocked(downloadApiFile).mockImplementationOnce(() => new Promise<void>((resolve) => {
      resolveDownload = resolve;
    }));
    renderArchives();
    await screen.findByText("Greenhill Academy");

    const pdfButton = screen.getByRole("button", { name: "Download PDF" }) as HTMLButtonElement;
    fireEvent.click(pdfButton);
    expect(screen.getByRole("button", { name: "Downloading..." }).hasAttribute("disabled")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Downloading..." }));
    expect(downloadApiFile).toHaveBeenCalledTimes(1);
    resolveDownload();
    await screen.findByText("Download started.");

    vi.mocked(downloadApiFile).mockRejectedValueOnce(Object.assign(
      new Error("snapshot storage unavailable"),
      { status: 503 },
    ));
    fireEvent.click(screen.getByText("More"));
    fireEvent.click(screen.getByRole("button", { name: "Download Data Snapshot" }));
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.getByRole("alert").textContent).toContain("Something went wrong");
  });

  it("shows result archives and opens historical class and student reports", async () => {
    vi.mocked(api.get).mockImplementation(async (path) => {
      if (path.includes("/students?")) {
        return {
          content: [{ studentId: "student-9", studentName: "Amina Maina", admissionNumber: "ADM-9" }],
          page: 0,
          size: 50,
          hasNext: false,
        } as never;
      }
      return {
        content: [resultArchive],
        page: 0,
        size: 20,
        hasNext: false,
      } as never;
    });
    renderArchives();
    expect(await screen.findByText("📊 Results Archive")).toBeTruthy();
    expect(screen.getByText("42 Students")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "View Results" }));
    await waitFor(() => expect(openApiFile).toHaveBeenCalledWith(
      "/school/archives/result-archive-8/pdf?disposition=inline",
      "results-report.pdf",
    ));

    fireEvent.click(screen.getByRole("button", { name: "Historical Students" }));
    expect(await screen.findByText(/Amina Maina/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "View" }));
    await waitFor(() => expect(openApiFile).toHaveBeenCalledWith(
      "/school/archives/result-archive-8/students/student-9/pdf?disposition=inline",
      "student-results.pdf",
    ));
    fireEvent.click(screen.getByRole("button", { name: "PDF" }));
    await waitFor(() => expect(downloadApiFile).toHaveBeenCalledWith(
      "/school/archives/result-archive-8/students/student-9/pdf",
      "student-results-student-9.pdf",
    ));
  });

  it("applies archive type, year, term, class, status, and debounced search on the server request", async () => {
    vi.mocked(getSchoolId).mockReturnValue("school-1");
    vi.mocked(api.get).mockImplementation(async (path) => {
      if (path.startsWith("/all/classes/")) {
        return [{ classId: "class-1", className: "Grade 6 North" }] as never;
      }
      return {
        content: [attendanceArchive],
        page: 0,
        size: 20,
        hasNext: false,
      } as never;
    });
    renderArchives();
    await screen.findByText("Greenhill Academy");

    fireEvent.click(screen.getByRole("tab", { name: "Results" }));
    await waitFor(() => expect(api.get).toHaveBeenLastCalledWith(
      expect.stringContaining("type=RESULT"),
    ));
    fireEvent.change(screen.getByRole("spinbutton", { name: "Filter by year" }), {
      target: { value: "2026" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: "Filter results by term" }), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: "Filter by class" }), {
      target: { value: "class-1" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: "Filter by status" }), {
      target: { value: "VERIFIED" },
    });
    fireEvent.change(screen.getByRole("searchbox", { name: "Search archives" }), {
      target: { value: "north" },
    });

    await waitFor(() => {
      const archiveRequests = vi.mocked(api.get).mock.calls.map(([path]) => String(path));
      expect(archiveRequests.some((path) =>
        path.includes("type=RESULT")
        && path.includes("year=2026")
        && path.includes("term=2")
        && path.includes("classId=class-1")
        && path.includes("status=VERIFIED")
        && path.includes("search=north"),
      )).toBe(true);
    });
  });
});
