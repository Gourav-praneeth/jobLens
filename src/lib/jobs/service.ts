import { fetchGreenhouseJobs } from "./greenhouse";
import type { CollectionError, GreenhouseCompany, NormalizedJob } from "./types";

export function getJobKey(job: NormalizedJob) {
  return `${job.provider}:${job.companySourceToken}:${job.externalId}`;
}

export function deduplicateJobs(jobs: NormalizedJob[]) {
  const uniqueJobs = new Map<string, NormalizedJob>();

  for (const job of jobs) {
    const key = getJobKey(job);
    const current = uniqueJobs.get(key);

    if (!current || new Date(job.sourceUpdatedAt) > new Date(current.sourceUpdatedAt)) {
      uniqueJobs.set(key, job);
    }
  }

  return [...uniqueJobs.values()].sort(
    (a, b) => new Date(b.sourceUpdatedAt).getTime() - new Date(a.sourceUpdatedAt).getTime(),
  );
}

export async function collectGreenhouseJobs(
  companies: readonly GreenhouseCompany[],
  fetchJobs: typeof fetchGreenhouseJobs = fetchGreenhouseJobs,
): Promise<{ jobs: NormalizedJob[]; errors: CollectionError[] }> {
  const results = await Promise.allSettled(companies.map((company) => fetchJobs(company)));
  const jobs: NormalizedJob[] = [];
  const errors: CollectionError[] = [];

  results.forEach((result, index) => {
    const company = companies[index];

    if (result.status === "fulfilled") {
      jobs.push(...result.value);
      return;
    }

    errors.push({
      companyName: company.name,
      boardToken: company.boardToken,
      message: result.reason instanceof Error ? result.reason.message : "Unknown ingestion error",
    });
  });

  return { jobs: deduplicateJobs(jobs), errors };
}

