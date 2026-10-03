import { describe, it, expect, beforeAll } from "vitest";
import { computeContentHash, normalizeString } from "@/lib/deduplication";

describe("Job Deduplication Engine", () => {
  it("computes deterministic SHA256 hashes", () => {
    const hash1 = computeContentHash("Acme Corp", "Data Analyst", "Full job description text.");
    const hash2 = computeContentHash("Acme Corp", "Data Analyst", "Full job description text.");
    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64);
  });

  it("produces identical hashes despite minor case and whitespace discrepancies", () => {
    const hash1 = computeContentHash("Acme Corp", "Data Analyst", "Analyze SQL and Python data.");
    const hash2 = computeContentHash("ACME CORP", "data analyst", "Analyze  SQL  and   Python data.  ");
    expect(hash1).toBe(hash2);
  });

  it("produces distinct hashes for different job positions", () => {
    const hash1 = computeContentHash("Acme Corp", "Data Analyst", "Description A");
    const hash2 = computeContentHash("Acme Corp", "Supply Chain Analyst", "Description B");
    expect(hash1).not.toBe(hash2);
  });

  it("normalizes strings reliably", () => {
    const norm = normalizeString("  Software Engineer / Kolkata, WB! ");
    expect(norm).toBe("software engineer kolkata wb");
  });
});
