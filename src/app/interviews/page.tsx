"use client";

import { useEffect, useState } from "react";
import { Calendar, Video, Clock, Building, CheckCircle2 } from "lucide-react";

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In our seed/demo, we can load interviews or empty state
    setLoading(false);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Interview Scheduling & Tracking</h1>
        <p className="text-sm text-slate-500 mt-1">
          Track recruiter interview rounds, calendar invitations, video meeting links, and prep notes.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center text-slate-400">
        <Calendar className="w-10 h-10 text-indigo-500 mx-auto mb-3" />
        <h3 className="font-bold text-slate-800 text-sm">No Scheduled Interviews Yet</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          When employer recruiter responses arrive or interviews are confirmed, they will be tracked here with meeting links and stage history.
        </p>
      </div>
    </div>
  );
}
