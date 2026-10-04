import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import { fetchGreenhouseJobs } from "../src/lib/jobs/greenhouse";
import type { GreenhouseJobsResponse } from "../src/lib/jobs/types";

const fixturePath = fileURLToPath(new URL("./fixtures/greenhouse-jobs.json", import.meta.url));
const fixture = JSON.parse(readFileSync(fixturePath, "utf8")) as GreenhouseJobsResponse;

describe("fetchGreenhouseJobs", () => {
  it("fetches full content and normalizes Greenhouse jobs", async () => {
    const fetcher = vi.fn(async () => Response.json(fixture));
    const jobs = await fetchGreenhouseJobs(
      { name: "Example", boardToken: "example" },
      { fetcher },
    );

    expect(fetcher).toHaveBeenCalledWith(
      "https://boards-api.greenhouse.io/v1/boards/example/jobs?content=true",
      expect.objectContaining({ headers: { Accept: "application/json" } }),
    );
    expect(jobs).toHaveLength(2);
    expect(jobs[0]).toMatchObject({
      provider: "greenhouse",
      externalId: "101",
      companyName: "Example",
      title: "Software Engineer, New Grad",
      departments: ["Engineering"],
      offices: ["San Francisco"],
    });
    expect(jobs[1].internalJobId).toBeNull();
    expect(jobs[1].descriptionHtml).toBeNull();
  });

  it("reports non-successful Greenhouse responses", async () => {
    const fetcher = vi.fn(async () => new Response("Not found", { status: 404 }));

    await expect(
      fetchGreenhouseJobs({ name: "Missing", boardToken: "missing" }, { fetcher }),
    ).rejects.toThrow("Greenhouse returned 404 for Missing");
  });
});

