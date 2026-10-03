import { NextRequest, NextResponse } from "next/server";
import { orchestrator } from "@/lib/orchestrator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || "FULL_PIPELINE";

    if (action === "DISCOVER_ONLY") {
      const res = await orchestrator.runJobDiscovery();
      return NextResponse.json({ success: true, action, result: res });
    }

    if (action === "ANALYZE_JOB" && body.jobId) {
      const res = await orchestrator.analyzeAndMatchJob(body.jobId);
      return NextResponse.json({ success: true, action, result: res });
    }

    if (action === "PREPARE_APPLICATION" && body.jobId) {
      const res = await orchestrator.prepareApplication(body.jobId);
      return NextResponse.json({ success: true, action, applicationId: res });
    }

    if (action === "SUBMIT_APPLICATION" && body.applicationId) {
      const res = await orchestrator.executeApplicationSubmission(body.applicationId);
      return NextResponse.json({ success: true, action, result: res });
    }

    // Default: run full autonomous pipeline
    const summary = await orchestrator.runFullPipeline();
    return NextResponse.json({ success: true, action: "FULL_PIPELINE", summary });
  } catch (err: any) {
    console.error("Pipeline run error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
