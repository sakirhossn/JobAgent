import { prisma } from "../prisma";
import { ApplicationStatus } from "@/types";

export interface StateTransitionResult {
  success: boolean;
  fromStatus: ApplicationStatus;
  toStatus: ApplicationStatus;
  eventId: string;
}

const VALID_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  DISCOVERED: ["ANALYZED", "SKIPPED", "DUPLICATE", "FAILED"],
  ANALYZED: ["MATCHED", "REVIEW_REQUIRED", "REJECTED", "SKIPPED", "FAILED"],
  MATCHED: ["REVIEW_REQUIRED", "APPROVED", "CV_GENERATED", "SKIPPED", "REJECTED"],
  REVIEW_REQUIRED: ["APPROVED", "REJECTED", "SKIPPED", "HUMAN_ACTION_REQUIRED"],
  APPROVED: ["CV_GENERATED", "APPLICATION_STARTED", "REJECTED", "SKIPPED"],
  CV_GENERATED: ["APPLICATION_STARTED", "APPROVED", "REVIEW_REQUIRED", "SKIPPED"],
  APPLICATION_STARTED: [
    "SUBMITTED",
    "CONFIRMED",
    "HUMAN_ACTION_REQUIRED",
    "FAILED",
    "REVIEW_REQUIRED",
  ],
  SUBMITTED: ["CONFIRMED", "FOLLOW_UP", "INTERVIEW", "REJECTED", "FAILED"],
  CONFIRMED: ["FOLLOW_UP", "INTERVIEW", "OFFER", "REJECTED"],
  FOLLOW_UP: ["INTERVIEW", "REJECTED", "EXPIRED", "FOLLOW_UP"],
  INTERVIEW: ["OFFER", "REJECTED", "INTERVIEW", "WITHDRAWN"],
  OFFER: ["WITHDRAWN", "CONFIRMED"],
  REJECTED: ["REVIEW_REQUIRED"],
  FAILED: ["APPLICATION_STARTED", "REVIEW_REQUIRED", "SKIPPED"],
  DUPLICATE: [],
  EXPIRED: [],
  WITHDRAWN: [],
  SKIPPED: ["REVIEW_REQUIRED", "APPROVED"],
  HUMAN_ACTION_REQUIRED: ["APPLICATION_STARTED", "APPROVED", "REJECTED", "SKIPPED", "REVIEW_REQUIRED"],
};

export async function transitionApplicationState(
  applicationId: string,
  toStatus: ApplicationStatus,
  message: string,
  metadata?: Record<string, any>
): Promise<StateTransitionResult> {
  const app = await prisma.application.findUnique({
    where: { id: applicationId },
  });

  if (!app) {
    throw new Error(`Application not found: ${applicationId}`);
  }

  const fromStatus = app.status as ApplicationStatus;
  const allowed = VALID_TRANSITIONS[fromStatus] || [];

  // If transition is valid or administrator manually forces a status update
  if (!allowed.includes(toStatus) && fromStatus !== toStatus) {
    console.warn(
      `Transition warning: ${fromStatus} -> ${toStatus} is non-standard, recording administrative override.`
    );
  }

  // Update application status
  await prisma.application.update({
    where: { id: applicationId },
    data: {
      status: toStatus,
      updatedAt: new Date(),
    },
  });

  // Create immutable ApplicationEvent
  const event = await prisma.applicationEvent.create({
    data: {
      applicationId,
      eventType: "STATE_TRANSITION",
      fromStatus,
      toStatus,
      message,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });

  return {
    success: true,
    fromStatus,
    toStatus,
    eventId: event.id,
  };
}
