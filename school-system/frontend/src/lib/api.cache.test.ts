import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { request, invalidateApiCache } from "./api";

// Behavioral proof that invalidate: ["students"] on a mutation clears ONLY
// student-tagged GET cache entries, leaving other resources cached.
describe("keyed cache invalidation", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let calls: { url: string; init?: RequestInit }[];

  beforeEach(() => {
    // Deterministic token so cache keys are stable across the test.
    localStorage.setItem("user", JSON.stringify({ token: "TOK123" }));
    invalidateApiCache();
    calls = [];
    fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({ url, init });
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

  it("scoped invalidation clears only the targeted resource", async () => {
    // 1. Warm students + teachers caches.
    await request("/get/all/students?schoolId=100");
    await request("/users/100/teachers");
    expect(calls.length).toBe(2);

    // 2. Both are cache hits -> no new fetches.
    await request("/get/all/students?schoolId=100");
    await request("/users/100/teachers");
    expect(calls.length).toBe(2);

    // 3. Mutate students with an explicit scoped key.
    await request("/update/student", {
      method: "PATCH",
      body: JSON.stringify({ studentId: "s1" }),
      invalidate: ["students"],
    });
    expect(calls.length).toBe(3);

    // 4. Students must refetch (cache invalidated).
    await request("/get/all/students?schoolId=100");
    expect(calls.length).toBe(4);

    // 5. Teachers remain cached (NOT invalidated).
    await request("/users/100/teachers");
    expect(calls.length).toBe(4);
  });

  it("falls back to wholesale clear when invalidate is absent", async () => {
    await request("/get/all/students?schoolId=100");
    await request("/users/100/teachers");
    expect(calls.length).toBe(2);

    // No `invalidate` -> wholesale clear.
    await request("/unknown/mutation", {
      method: "PATCH",
      body: JSON.stringify({ studentId: "s1" }),
    });
    expect(calls.length).toBe(3);

    // Both caches gone -> both refetch.
    await request("/get/all/students?schoolId=100");
    await request("/users/100/teachers");
    expect(calls.length).toBe(5);
  });

  it("teacher edit scoped invalidation clears only teachers", async () => {
    await request("/get/all/students?schoolId=100");
    await request("/users/100/teachers");
    expect(calls.length).toBe(2);

    await request("/users/update", {
      method: "PATCH",
      body: JSON.stringify({ teacherId: "t1" }),
    });
    expect(calls.length).toBe(3);

    // Teachers invalidated.
    await request("/users/100/teachers");
    expect(calls.length).toBe(4);

    // Students remain cached.
    await request("/get/all/students?schoolId=100");
    expect(calls.length).toBe(4);
  });

  it("does not let an invalidated in-flight GET repopulate stale cache", async () => {
    let resolveStaleResponse!: (response: Response) => void;
    let studentFetches = 0;
    fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
      calls.push({ url, init });
      if (url.includes("/get/all/students")) {
        studentFetches += 1;
        if (studentFetches === 1) {
          return new Promise<Response>((resolve) => {
            resolveStaleResponse = resolve;
          });
        }
        return new Response(JSON.stringify([{ id: "fresh" }]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });

    const staleRead = request<{ id: string }[]>("/get/all/students?schoolId=100");
    await request("/update/student", {
      method: "PATCH",
      invalidate: ["students"],
    });

    const freshRead = await request<{ id: string }[]>(
      "/get/all/students?schoolId=100",
    );
    resolveStaleResponse(
      new Response(JSON.stringify([{ id: "stale" }]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    await staleRead;

    expect(await request<{ id: string }[]>("/get/all/students?schoolId=100"))
      .toEqual(freshRead);
    expect(freshRead).toEqual([{ id: "fresh" }]);
    expect(studentFetches).toBe(2);
  });
});