import { describe, expect, it, vi } from "vitest";
import { collectGreenhouseJobs, deduplicateJobs } from "../src/lib/jobs/service";
import type { NormalizedJob } from "../src/lib/jobs/types";

function makeJob(overrides: Partial<NormalizedJob> = {}): NormalizedJob {
  return {
    provider: "greenhouse",
    externalId: "101",
    internalJobId: "501",
    companyName: "Example",
    companySourceToken: "example",
    title: "Software Engineer",
    location: "Remote",
    descriptionHtml: null,
    departments: ["Engineering"],
    offices: [],
    sourceUrl: "https://example.com/jobs/101",
    sourceUpdatedAt: "2026-10-01T00:00:00Z",
    requisitionId: null,
    ...overrides,
  };
}

describe("job collection", () => {
  it("deduplicates by provider, source token, and external id", () => {
    const jobs = deduplicateJobs([
      makeJob({ title: "Old title", sourceUpdatedAt: "2026-09-01T00:00:00Z" }),
      makeJob({ title: "Current title", sourceUpdatedAt: "2026-10-01T00:00:00Z" }),
    ]);

    expect(jobs).toHaveLength(1);
    expect(jobs[0].title).toBe("Current title");
  });

  it("keeps successful companies when another source fails", async () => {
    const fetchJobs = vi.fn(async (company: { name: string }) => {
      if (company.name === "Broken") throw new Error("Board unavailable");
      return [makeJob()];
    });

    const result = await collectGreenhouseJobs(
      [
        { name: "Example", boardToken: "example" },
        { name: "Broken", boardToken: "broken" },
      ],
      fetchJobs,
    );

    expect(result.jobs).toHaveLength(1);
    expect(result.errors).toEqual([
      { companyName: "Broken", boardToken: "broken", message: "Board unavailable" },
    ]);
  });
});

