import type {
  GreenhouseCompany,
  GreenhouseJobResponse,
  GreenhouseJobsResponse,
  NormalizedJob,
} from "./types";

const GREENHOUSE_API_BASE = "https://boards-api.greenhouse.io/v1/boards";

export class GreenhouseRequestError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "GreenhouseRequestError";
  }
}

export function normalizeGreenhouseJob(
  company: GreenhouseCompany,
  job: GreenhouseJobResponse,
): NormalizedJob {
  return {
    provider: "greenhouse",
    externalId: String(job.id),
    internalJobId: job.internal_job_id === null ? null : String(job.internal_job_id),
    companyName: company.name,
    companySourceToken: company.boardToken,
    title: job.title.trim(),
    location: job.location?.name?.trim() || "Location not specified",
    descriptionHtml: job.content ?? null,
    departments: (job.departments ?? []).map((department) => department.name),
    offices: (job.offices ?? []).map((office) => office.name),
    sourceUrl: job.absolute_url,
    sourceUpdatedAt: job.updated_at,
    requisitionId: job.requisition_id ?? null,
  };
}

export async function fetchGreenhouseJobs(
  company: GreenhouseCompany,
  options: { fetcher?: typeof fetch; timeoutMs?: number } = {},
): Promise<NormalizedJob[]> {
  const fetcher = options.fetcher ?? fetch;
  const timeoutMs = options.timeoutMs ?? 15_000;
  const boardToken = encodeURIComponent(company.boardToken);
  const url = `${GREENHOUSE_API_BASE}/${boardToken}/jobs?content=true`;

  let response: Response;

  try {
    response = await fetcher(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown network error";
    throw new GreenhouseRequestError(`Could not fetch ${company.name}: ${detail}`);
  }

  if (!response.ok) {
    throw new GreenhouseRequestError(
      `Greenhouse returned ${response.status} for ${company.name}`,
      response.status,
    );
  }

  const payload = (await response.json()) as Partial<GreenhouseJobsResponse>;

  if (!Array.isArray(payload.jobs)) {
    throw new GreenhouseRequestError(`Greenhouse returned an invalid jobs payload for ${company.name}`);
  }

  return payload.jobs.map((job) => normalizeGreenhouseJob(company, job));
}

