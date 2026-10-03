"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building,
  MapPin,
  Calendar,
  ExternalLink,
  Copy,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Send,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Mail,
  HelpCircle,
} from "lucide-react";

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/jobs/${params.id}`);
      const data = await res.json();
      if (data.success) {
        setJob(data.job);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [params.id]);

  const handlePrepareApplication = async () => {
    try {
      setActionMessage("Tailoring ATS CV and preparing application...");
      const res = await fetch("/api/pipeline/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "PREPARE_APPLICATION", jobId: params.id }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage("Application and tailored CV successfully created!");
        setTimeout(() => setActionMessage(null), 3000);
        fetchJob();
      } else {
        setActionMessage(`Error: ${data.error}`);
      }
    } catch (e: any) {
      setActionMessage(`Error: ${e.message}`);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading job details...</div>;
  }

  if (!job) {
    return <div className="p-8 text-center text-rose-500">Job not found.</div>;
  }

  const match = job.match;

  return (
    <div className="space-y-6">
      {/* Top back button */}
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Discovered Jobs</span>
      </Link>

      {/* Main Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
            {job.isExcluded && (
              <span className="text-xs bg-rose-100 text-rose-800 font-bold px-2.5 py-0.5 rounded-full">
                EXCLUDED
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-2">
            <span className="flex items-center gap-1 font-semibold text-slate-800">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              {job.company}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {job.location} ({job.remoteType})
            </span>
            <span>•</span>
            <span className="font-semibold text-emerald-700">
              {job.salaryMax ? `₹${job.salaryMin?.toLocaleString()} - ₹${job.salaryMax?.toLocaleString()}/month` : "Salary Undisclosed"}
            </span>
            <span>•</span>
            <span>{job.employmentType}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {actionMessage && (
            <span className="text-xs font-medium px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg">
              {actionMessage}
            </span>
          )}
          {!job.application ? (
            <button
              onClick={handlePrepareApplication}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition"
            >
              <Sparkles className="w-4 h-4 text-indigo-200" />
              <span>Tailor CV & Prepare</span>
            </button>
          ) : (
            <Link
              href={`/applications/${job.application.id}`}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition"
            >
              <Send className="w-4 h-4" />
              <span>View Application ({job.application.status})</span>
            </Link>
          )}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: FULL ORIGINAL JOB DESCRIPTION (Never Hidden) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Original Job Description</h2>
              <span className="text-xs text-slate-500">Byte-for-byte preserved source text</span>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(job.originalDescription);
                alert("Original description copied!");
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Text</span>
            </button>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed select-text max-h-[500px] overflow-y-auto">
            {job.originalDescription}
          </div>

          <div className="pt-2 text-xs text-slate-500 space-y-1">
            <p>
              <strong>Content Hash:</strong> <span className="font-mono text-[11px]">{job.contentHash}</span>
            </p>
            {job.applicationUrl && (
              <p className="flex items-center gap-1">
                <strong>Portal URL:</strong>
                <a
                  href={job.applicationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 hover:underline flex items-center gap-1"
                >
                  {job.applicationUrl}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            )}
            {job.applicationEmail && (
              <p className="flex items-center gap-1">
                <strong>Application Email:</strong>
                <span className="font-semibold text-slate-700">{job.applicationEmail}</span>
              </p>
            )}
          </div>
        </div>

        {/* Right Column: TRANSPARENT MATCH BREAKDOWN & AI ANALYSIS */}
        <div className="space-y-6">
          {/* Match Score Card */}
          {match && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Transparent Match Analysis</h2>
                  <p className="text-xs text-slate-500">10-factor candidate evaluation breakdown</p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    match.classification === "AUTO_APPLY_ELIGIBLE"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : match.classification === "REVIEW_REQUIRED"
                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                      : "bg-rose-100 text-rose-800 border border-rose-300"
                  }`}
                >
                  {match.overallScore}% — {match.classification}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700">
                <strong>Recommendation:</strong> {match.recommendationReason}
              </div>

              {/* Factor Breakdown Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="px-3 py-2">Factor</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Evaluation Detail</th>
                      <th className="px-3 py-2 text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {match.factorBreakdown.map((f: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-3 py-2 font-medium text-slate-800">{f.factor}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                              f.status === "MATCH" || f.status === "ACCEPTED_FOR_FRESHER"
                                ? "bg-emerald-50 text-emerald-700"
                                : f.status === "PARTIAL_MATCH" || f.status === "UNKNOWN"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-rose-50 text-rose-700"
                            }`}
                          >
                            {f.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-slate-600 max-w-xs">{f.detail}</td>
                        <td className="px-3 py-2 text-right font-bold text-slate-800">
                          {f.score}/{f.weight}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Skills matched vs missing */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                  <span className="text-[11px] font-bold text-emerald-800 block mb-1">
                    Matched Skills ({match.matchedSkills.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {match.matchedSkills.map((s: string, i: number) => (
                      <span key={i} className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[11px] font-bold text-slate-700 block mb-1">
                    Missing Skills ({match.missingSkills.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {match.missingSkills.map((s: string, i: number) => (
                      <span key={i} className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                        {s}
                      </span>
                    ))}
                    {match.missingSkills.length === 0 && (
                      <span className="text-[10px] text-slate-400 italic">None (100% matched)</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Structured Requirements */}
          {job.requirements && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
              <h2 className="text-base font-bold text-slate-900">AI Structured Analysis</h2>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block text-[10px] uppercase">Seniority Level</span>
                  <span className="font-semibold text-slate-800">{job.requirements.seniority}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block text-[10px] uppercase">Fresher Eligible</span>
                  <span className="font-semibold text-slate-800">{job.requirements.fresherEligible ? "Yes" : "No"}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block text-[10px] uppercase">Application Route</span>
                  <span className="font-semibold text-slate-800">{job.requirements.applicationRoute}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block text-[10px] uppercase">Joining Timeline</span>
                  <span className="font-semibold text-slate-800">
                    {job.requirements.joiningTimelineDays ? `${job.requirements.joiningTimelineDays} days` : "Standard (30 days)"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
