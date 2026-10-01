import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { request, invalidateApiCache } from "./api";

// Observation-only harness. Prints the network log; no assertions.
describe("network log", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let calls: string[];

  beforeEach(() => {
    localStorage.setItem("user", JSON.stringify({ token: "TOK123" }));
    invalidateApiCache();
    calls = [];
    fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      const method = (init?.method || "GET").toUpperCase();
      calls.push(`${method} ${url}`);
      let body: unknown;
      if (url.includes("/get/all/students")) body = [{ id: "s1" }];
      else if (url.includes("/users/100/teachers")) body = [{ id: "t1" }];
      else if (url.includes("/update/student")) body = { ok: true };
      else body = {};
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

  const log = (label: string) => {
    console.log(`\n--- ${label} ---`);
    calls.forEach((c, i) => console.log(`  ${i + 1}. ${c}`));
  };

  it("scenario A: scoped invalidation", async () => {
    await request("/get/all/students?schoolId=100");
    await request("/users/100/teachers");
    log("after warming students + teachers (expect 2 fetches)");

    await request("/get/all/students?schoolId=100");
    await request("/users/100/teachers");
    log("after re-requesting both (expect still 2 - both cached)");

    await request("/update/student", {
      method: "PATCH",
      body: JSON.stringify({ studentId: "s1" }),
      invalidate: ["students"],
    });
    log("after PATCH /update/student with invalidate:['students'] (expect 3)");

    await request("/get/all/students?schoolId=100");
    log("after re-requesting students (expect 4 - students invalidated)");

    await request("/users/100/teachers");
    log("after re-requesting teachers (expect still 4 - teachers NOT touched)");

    expect(calls.length).toBe(4);
  });

  it("scenario B: wholesale fallback (no invalidate)", async () => {
    await request("/get/all/students?schoolId=100");
    await request("/users/100/teachers");
    log("after warming students + teachers (expect 2 fetches)");

    await request("/unknown/mutation", {
      method: "PATCH",
      body: JSON.stringify({ studentId: "s1" }),
    });
    log("after an unmapped PATCH with NO invalidate (expect 3)");

    await request("/get/all/students?schoolId=100");
    await request("/users/100/teachers");
    log("after re-requesting both (expect 5 - wholesale clear wiped both)");

    expect(calls.length).toBe(5);
  });

  it("scenario C: teacher edit scoped invalidation", async () => {
    await request("/get/all/students?schoolId=100");
    await request("/users/100/teachers");
    log("after warming students + teachers (expect 2 fetches)");

    await request("/users/update", {
      method: "PATCH",
      body: JSON.stringify({ teacherId: "t1" }),
      invalidate: ["teachers"],
    });
    log("after PATCH /users/update with invalidate:['teachers'] (expect 3)");

    await request("/users/100/teachers");
    log("after re-requesting teachers (expect 4 - teachers invalidated)");

    await request("/get/all/students?schoolId=100");
    log("after re-requesting students (expect still 4 - students NOT touched)");

    expect(calls.length).toBe(4);
  });
});