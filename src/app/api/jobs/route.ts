import { NextRequest, NextResponse } from "next/server";
import { GREENHOUSE_COMPANIES, getGreenhouseCompany } from "@/config/companies";
import { collectGreenhouseJobs } from "@/lib/jobs/service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const requestedToken = request.nextUrl.searchParams.get("company");
  const requestedCompany = requestedToken ? getGreenhouseCompany(requestedToken) : undefined;

  if (requestedToken && !requestedCompany) {
    return NextResponse.json(
      {
        error: "Unknown company",
        availableCompanies: GREENHOUSE_COMPANIES.map(({ name, boardToken }) => ({
          name,
          boardToken,
        })),
      },
      { status: 400 },
    );
  }

  const companies = requestedCompany ? [requestedCompany] : GREENHOUSE_COMPANIES;
  const result = await collectGreenhouseJobs(companies);

  return NextResponse.json(
    {
      generatedAt: new Date().toISOString(),
      companiesRequested: companies.length,
      jobsCount: result.jobs.length,
      errors: result.errors,
      jobs: result.jobs,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
      },
      status: result.jobs.length === 0 && result.errors.length > 0 ? 502 : 200,
    },
  );
}

