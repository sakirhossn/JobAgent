import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check for simulated CAPTCHA trigger
    if (body.simulateCaptcha) {
      return NextResponse.json(
        {
          success: false,
          error: "CAPTCHA_CHALLENGE_REQUIRED",
          message: "Anti-bot challenge presented. Automation stopped.",
        },
        { status: 403 }
      );
    }

    // Required fields check
    const required = ["fullName", "email", "phone"];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          {
            success: false,
            error: "MISSING_REQUIRED_FIELD",
            message: `Field "${field}" is mandatory.`,
          },
          { status: 400 }
        );
      }
    }

    const confirmationId = `APP-CONF-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    return NextResponse.json({
      success: true,
      confirmationId,
      receiptTimestamp: new Date().toISOString(),
      applicantName: body.fullName,
      email: body.email,
      message: "Application successfully registered in Employer ATS system.",
      referenceUrl: `http://localhost:3000/api/mock-portal/receipt/${confirmationId}`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const jobId = url.searchParams.get("jobId");

  return NextResponse.json({
    status: "PORTAL_ACTIVE",
    jobId,
    formAction: "/api/mock-portal/apply",
    method: "POST",
    supportedFields: [
      { name: "fullName", label: "Full Name", required: true, type: "text" },
      { name: "email", label: "Email Address", required: true, type: "email" },
      { name: "phone", label: "Phone Number", required: true, type: "tel" },
      { name: "currentCity", label: "Current City / Location", required: true, type: "text" },
      { name: "noticePeriod", label: "Notice Period / Joining Availability", required: true, type: "text" },
      { name: "cvUpload", label: "Resume / CV Attachment", required: true, type: "file" },
    ],
  });
}
