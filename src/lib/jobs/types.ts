export interface GreenhouseCompany {
  name: string;
  boardToken: string;
}

export interface GreenhouseJobResponse {
  id: number;
  internal_job_id: number | null;
  title: string;
  updated_at: string;
  requisition_id?: string | null;
  location: { name: string };
  absolute_url: string;
  language?: string;
  content?: string;
  departments?: Array<{ id: number; name: string }>;
  offices?: Array<{ id: number; name: string; location?: string | null }>;
}

export interface GreenhouseJobsResponse {
  jobs: GreenhouseJobResponse[];
  meta?: { total: number };
}

export interface NormalizedJob {
  provider: "greenhouse";
  externalId: string;
  internalJobId: string | null;
  companyName: string;
  companySourceToken: string;
  title: string;
  location: string;
  descriptionHtml: string | null;
  departments: string[];
  offices: string[];
  sourceUrl: string;
  sourceUpdatedAt: string;
  requisitionId: string | null;
}

export interface CollectionError {
  companyName: string;
  boardToken: string;
  message: string;
}

