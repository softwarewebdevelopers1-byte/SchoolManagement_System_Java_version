import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api, invalidateApiCache } from "./api";

describe("dashboard user data", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.setItem(
      "user",
      JSON.stringify({ token: "TOK123", schoolId: "school-1" }),
    );
    invalidateApiCache();
    fetchMock = vi.fn(async (url: string) => {
      let body: unknown;
      if (url.includes("/get/all/students")) {
        body = {
          content: [
            { studentId: "student-1", studentFullName: "Ada Student" },
            { studentId: "student-2" },
          ],
        };
      } else {
        body = [];
      }
      return new Response(JSON.stringify(body), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });
    // @ts-expect-error inject mock fetch
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    fetchMock.mockRestore();
    invalidateApiCache();
  });

  it("provides safe display names for dashboard student avatars", async () => {
    const data = await api.get<{ students: { name: string }[] }>("/users");

    expect(data.students.map((student) => student.name)).toEqual([
      "Ada Student",
      "Unknown student",
    ]);
  });
});
