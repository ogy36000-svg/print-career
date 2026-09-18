export interface ResearchRequestStatus {
  signature: string;
  busy: boolean;
  message: string;
  request: AbortController | null;
}

export function settleResearchRequest(
  status: ResearchRequestStatus,
  request: AbortController,
): ResearchRequestStatus {
  return status.request === request
    ? { ...status, busy: false, request: null }
    : status;
}
