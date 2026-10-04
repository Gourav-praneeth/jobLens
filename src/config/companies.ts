import type { GreenhouseCompany } from "@/lib/jobs/types";

export const GREENHOUSE_COMPANIES: readonly GreenhouseCompany[] = [
  { name: "Stripe", boardToken: "stripe" },
  { name: "Cloudflare", boardToken: "cloudflare" },
  { name: "Datadog", boardToken: "datadog" },
  { name: "Figma", boardToken: "figma" },
  { name: "Discord", boardToken: "discord" },
];

export function getGreenhouseCompany(boardToken: string) {
  const normalizedToken = boardToken.trim().toLowerCase();

  return GREENHOUSE_COMPANIES.find(
    (company) => company.boardToken.toLowerCase() === normalizedToken,
  );
}

