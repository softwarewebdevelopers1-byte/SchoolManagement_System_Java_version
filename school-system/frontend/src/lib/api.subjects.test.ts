import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { api, request, invalidateApiCache } from "./api";

// Three-scenario proof that subject mutations invalidate ONLY the
// subjects cache, leaving students (and everything else) cached.
// Exercises the real api.put / api.post / api.delete wrappers, which
// forward `init` into request() -> invalidateApiCacheKeys(["subjects"]).
describe("subject keyed invalidation", () => {
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
      else if (url.includes("/getAll/subjects")) body = [{ id: "sub1", subjectName: "Maths" }];
      else if (url.includes("/update/subject")) body = { ok: true };
      else if (url.includes("/create/subject")) body = { ok: true };
      else if (url.includes("/school/subjects/") && method === "DELETE") body = { ok: true };
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

  it("Scenario A: subject edit (api.put)", async () => {
    await request("/get/all/students?schoolId=100");
    await request("/getAll/subjects/100");
    log("after warming students + subjects (expect 2 fetches)");

    // Edit a subject via the real wrapper.
    await api.put("/school/subjects/sub1", { name: "Physics", mainTeacherId: "t1" }, { invalidate: ["subjects"] });
    log("after subject edit via api.put (expect 3)");

    await request("/get/all/students?schoolId=100");
    log("after re-requesting students (expect still 3 - 0 GETs)");

    await request("/getAll/subjects/100");
    log("after re-requesting subjects (expect 4 - subjects invalidated)");

    expect(calls.length).toBe(4);
  });

  it("Scenario B: subject create (api.post + loadSubjectsOnly replica)", async () => {
    await request("/get/all/students?schoolId=100");
    await request("/getAll/subjects/100");
    log("after warming students + subjects (expect 2 fetches)");

    // Create via the real wrapper.
    await api.post("/school/subjects", { name: "Biology", mainTeacherId: null }, { invalidate: ["subjects"] });
    log("after subject create via api.post (expect 3)");

    // Replicate loadSubjectsOnly(): it fires immediately after the
    // mutation and repopulates the subjects cache.
    await request("/getAll/subjects/100");
    log("after loadSubjectsOnly() replica (expect 4 - fresh subjects load)");

    await request("/get/all/students?schoolId=100");
    log("after re-requesting students (expect still 4 - 0 GETs)");

    await request("/getAll/subjects/100");
    log("after re-requesting subjects (expect still 4 - served from fresh cache)");

    expect(calls.length).toBe(4);
  });

  it("Scenario C: subject delete (api.delete)", async () => {
    await request("/get/all/students?schoolId=100");
    await request("/getAll/subjects/100");
    log("after warming students + subjects (expect 2 fetches)");

    // Delete via the real wrapper.
    await api.delete("/school/subjects/sub1", { invalidate: ["subjects"] });
    log("after subject delete via api.delete (expect 3)");

    await request("/get/all/students?schoolId=100");
    log("after re-requesting students (expect still 3 - 0 GETs)");

    await request("/getAll/subjects/100");
    log("after re-requesting subjects (expect 4 - subjects invalidated)");

    expect(calls.length).toBe(4);
  });
});