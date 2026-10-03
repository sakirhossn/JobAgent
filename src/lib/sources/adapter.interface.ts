import { NormalizedJob } from "@/types";

export interface JobSearchQuery {
  keywords?: string[];
  locations?: string[];
  limit?: number;
}

export interface RawSourceJob {
  sourceJobId: string;
  sourceId: string;
  url?: string;
  payload: Record<string, any>;
}

export interface JobSourceAdapter {
  readonly id: string;
  readonly name: string;
  readonly adapterType: string;

  /**
   * Discovers raw job listings from this source respecting rate limits.
   */
  searchJobs(query: JobSearchQuery): Promise<RawSourceJob[]>;

  /**
   * Fetches full job details if separate from listing.
   */
  fetchJobDetails(rawJob: RawSourceJob): Promise<RawSourceJob>;

  /**
   * Normalizes raw source payload into canonical NormalizedJob schema,
   * strictly preserving the unmodified original job description.
   */
  normalizeJob(rawJob: RawSourceJob): NormalizedJob;
}
