import type { OpportunityResponse } from "./types";

// The caller isolates results by profile signature before retaining discovery URLs.
export function mergeOpportunityResults(
  previous: OpportunityResponse | null,
  incoming: OpportunityResponse,
): OpportunityResponse {
  const retained =
    previous?.major.trim().toLowerCase() === incoming.major.trim().toLowerCase()
      ? previous.leads
      : [];
  const leads = new Map(retained.map((lead) => [lead.url, lead]));
  for (const lead of incoming.leads) leads.set(lead.url, lead);
  return { ...incoming, leads: [...leads.values()] };
}
