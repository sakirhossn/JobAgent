import { ApplicationMethod } from "@/types";

export interface RouteDetectionResult {
  route: ApplicationMethod;
  emailRecipient?: string;
  applicationUrl?: string;
  confidence: number;
  reason: string;
}

export function detectApplicationRoute(job: {
  applicationEmail?: string | null;
  applicationUrl?: string | null;
  originalDescription: string;
}): RouteDetectionResult {
  const desc = job.originalDescription.toLowerCase();

  // 1. Detect if manual review is strictly required (CAPTCHA, OTP, Security barriers)
  if (desc.includes("captcha") || desc.includes("mfa") || desc.includes("otp required") || desc.includes("in-person walk-in")) {
    return {
      route: "MANUAL",
      confidence: 0.95,
      reason: "Detected CAPTCHA/MFA/Security requirement: routed to Human Action Required.",
    };
  }

  // 2. Direct Email Route
  if (job.applicationEmail) {
    return {
      route: "EMAIL",
      emailRecipient: job.applicationEmail,
      confidence: 0.99,
      reason: `Direct recruiter/company application email specified: ${job.applicationEmail}`,
    };
  }

  // Extract email regex from description if present
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  const emailsInDesc = job.originalDescription.match(emailRegex);
  if (emailsInDesc && emailsInDesc.length > 0 && (desc.includes("send resume") || desc.includes("apply at") || desc.includes("email your cv"))) {
    return {
      route: "EMAIL",
      emailRecipient: emailsInDesc[0],
      confidence: 0.9,
      reason: `Application email discovered in posting body: ${emailsInDesc[0]}`,
    };
  }

  // 3. Website Route
  if (job.applicationUrl) {
    return {
      route: "WEBSITE",
      applicationUrl: job.applicationUrl,
      confidence: 0.95,
      reason: `Web application URL identified: ${job.applicationUrl}`,
    };
  }

  // 4. Default to MANUAL
  return {
    route: "MANUAL",
    confidence: 0.8,
    reason: "No direct URL or email identified; requires manual review.",
  };
}
