"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Send,
  Eye,
  Copy,
  ExternalLink,
  Sparkles,
  Loader2,
  Building,
  MapPin,
  IndianRupee,
  Calendar,
} from "lucide-react";

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [classificationFilter, setClassificationFilter] = useState("");
  const [selectedJobForModal, setSelectedJobForModal] = useState<any | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (classificationFilter) params.set("classification", classificationFilter);

      const res = await fetch(`/api/jobs?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setJobs(data.jobs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [classificationFilter]);

  const handleAction = async (jobId: string, actionType: string) => {
    try {
      setActionLoadingId(jobId);
      setActionMessage(`Running ${actionType}...`);

      let endpoint = "/api/pipeline/run";
      let body: any = {};

      if (actionType === "ANALYZE") {
        body = { action: "ANALYZE_JOB", jobId };
      } else if (actionType === "GENERATE_CV") {
        body = { action: "PREPARE_APPLICATION", jobId };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        setActionMessage(`Action ${actionType} completed successfully!`);
        setTimeout(() => setActionMessage(null), 3000);
        loadJobs();
      } else {
        setActionMessage(`Failed: ${data.error}`);
        setTimeout(() => setActionMessage(null), 4000);
      }
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
      setTimeout(() => setActionMessage(null), 4000);
    } finally {
      setActionLoadingId(null);
    }
  };

  const openOriginalDescriptionModal = async (jobId: string) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`);
      const data = await res.json();
      if (data.success) {
        setSelectedJobForModal(data.job);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Discovered Canonical Jobs</h1>
          <p className="text-sm text-slate-500 mt-1">
            Normalized jobs across sources with deduplication, factor matching, and original description preservation.
          </p>
        </div>
        {actionMessage && (
          <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
            {actionMessage}
          </div>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadJobs();
          }}
          className="relative flex-1 w-full"
        >
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search role, company, location, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={classificationFilter}
            onChange={(e) => setClassificationFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">All Match Classifications</option>
            <option value="AUTO_APPLY_ELIGIBLE">AUTO_APPLY_ELIGIBLE</option>
            <option value="REVIEW_REQUIRED">REVIEW_REQUIRED</option>
            <option value="NOT_ELIGIBLE">NOT_ELIGIBLE</option>
          </select>
          <button
            onClick={loadJobs}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Company & Job Title</th>
                <th className="px-6 py-3.5">Location</th>
                <th className="px-6 py-3.5">Salary</th>
                <th className="px-6 py-3.5">Match Assessment</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.map((job) => {
                const matchClass = job.match?.classification;
                const score = job.match?.overallScore;
                return (
                  <tr key={job.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 flex items-center gap-2">
                        <span>{job.title}</span>
                        {job.isExcluded && (
                          <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded">
                            EXCLUDED
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-medium text-slate-700">{job.company}</span>
                        <span>•</span>
                        <span>{job.sources?.[0]?.name || "Feed"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-700 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {job.location} ({job.remoteType})
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-800">
                      {job.salaryMax ? (
                        <span>
                          ₹{job.salaryMin ? `${job.salaryMin.toLocaleString()} - ` : ""}
                          {job.salaryMax.toLocaleString()}/mo
                        </span>
                      ) : (
                        <span className="text-slate-400">Undisclosed</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {job.match ? (
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                matchClass === "AUTO_APPLY_ELIGIBLE"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : matchClass === "REVIEW_REQUIRED"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {score}% {matchClass}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 block mt-1 truncate max-w-xs">
                            {job.match.recommendationReason}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Unanalyzed</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {job.application ? (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          {job.application.status}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Not Applied</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openOriginalDescriptionModal(job.id)}
                          title="View Original Job Description"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/jobs/${job.id}`}
                          className="px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition"
                        >
                          Details
                        </Link>
                        {!job.match && (
                          <button
                            onClick={() => handleAction(job.id, "ANALYZE")}
                            disabled={actionLoadingId === job.id}
                            className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition"
                          >
                            Analyze
                          </button>
                        )}
                        {job.match && !job.application && (
                          <button
                            onClick={() => handleAction(job.id, "GENERATE_CV")}
                            disabled={actionLoadingId === job.id}
                            className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition"
                          >
                            Tailor CV
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {jobs.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400 text-sm">
                    No jobs found matching criteria. Click "Run AI Pipeline" to discover jobs.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULL ORIGINAL JOB DESCRIPTION MODAL (Requirement 35) */}
      {selectedJobForModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in-50 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{selectedJobForModal.title}</h3>
                <p className="text-xs text-slate-500">
                  {selectedJobForModal.company} • {selectedJobForModal.location}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedJobForModal.originalDescription);
                    alert("Original job description copied to clipboard!");
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy</span>
                </button>
                <button
                  onClick={() => setSelectedJobForModal(null)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold px-2 py-1"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body: UNALTERED ORIGINAL TEXT */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Full Original Job Description:</strong> Stored byte-for-byte from the source listing. Never overwritten or replaced with AI summaries.
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed select-text">
                {selectedJobForModal.originalDescription}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-between items-center text-xs text-slate-500">
              <span>Canonical ID: {selectedJobForModal.id}</span>
              <Link
                href={`/jobs/${selectedJobForModal.id}`}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Go to Full Match Analysis Page →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
