import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api, downloadApiFile } from "./api";

describe("authenticated archive downloads", () => {
  beforeEach(() => {
    localStorage.setItem("user", JSON.stringify({ token: "test-token" }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    localStorage.removeItem("user");
  });

  it("uses the persisted filename and delays revoking the download URL", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: (name: string) => name.toLowerCase() === "content-disposition"
          ? 'attachment; filename="greenhill-attendance-snapshot.json"'
          : "application/json",
      },
      blob: async () => new Blob(["{\"days\":[]}"], { type: "application/json" }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const createObjectUrl = vi.fn(() => "blob:archive");
    const revokeObjectUrl = vi.fn();
    const oldCreate = Object.getOwnPropertyDescriptor(URL, "createObjectURL");
    const oldRevoke = Object.getOwnPropertyDescriptor(URL, "revokeObjectURL");
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: createObjectUrl });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: revokeObjectUrl });
    const clickedFilename = vi.fn();
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(function (this: HTMLAnchorElement) {
        clickedFilename(this.download);
      });
    const timeout = vi.spyOn(window, "setTimeout").mockImplementation(() => 1);

    try {
      await downloadApiFile("/school/attendance-archives/id/snapshot");
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0][0]).toContain("/school/attendance-archives/id/snapshot");
      expect(click).toHaveBeenCalledTimes(1);
      expect(clickedFilename).toHaveBeenCalledWith("greenhill-attendance-snapshot.json");
      expect(createObjectUrl).toHaveBeenCalledTimes(1);
      expect(revokeObjectUrl).not.toHaveBeenCalled();
      expect(timeout).toHaveBeenCalledWith(expect.any(Function), 1000);
      const cleanup = timeout.mock.calls[0][0] as () => void;
      cleanup();
      expect(revokeObjectUrl).toHaveBeenCalledWith("blob:archive");
    } finally {
      if (oldCreate) Object.defineProperty(URL, "createObjectURL", oldCreate);
      else Reflect.deleteProperty(URL, "createObjectURL");
      if (oldRevoke) Object.defineProperty(URL, "revokeObjectURL", oldRevoke);
      else Reflect.deleteProperty(URL, "revokeObjectURL");
    }
  });

  it("throws a visible HTTP error instead of downloading an error body", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: async () => JSON.stringify({ message: "Archive artifact not found" }),
    }));

    await expect(downloadApiFile("/school/attendance-archives/id/manifest"))
      .rejects.toMatchObject({ status: 404, message: "Archive artifact not found" });
  });

  it("preserves unified archive filters and pagination in the request URL", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({
        status: "Success",
        data: { content: [], page: 2, size: 20, hasNext: false },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const query = "page=2&size=20&type=RESULT&year=2026&term=2&search=filter-regression";

    const result = await api.get(`/school/archives?${query}`);

    expect(result).toMatchObject({ page: 2, size: 20 });
    expect(fetchMock.mock.calls[0][0]).toContain(`/school/archives?${query}`);
  });
});
