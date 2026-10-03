"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Send,
  Building,
  Mail,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Filter,
  Search,
} from "lucide-react";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");

  const loadApplications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (methodFilter) params.set("method", methodFilter);

      const res = await fetch(`/api/applications?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setApplications(data.applications);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [statusFilter, methodFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Applications Tracking</h1>
          <p className="text-sm text-slate-500 mt-1">
            Complete application history with immutable state transitions, tailored CV snapshots, and confirmation IDs.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">All Statuses</option>
            <option value="APPROVED">APPROVED</option>
            <option value="CV_GENERATED">CV_GENERATED</option>
            <option value="APPLICATION_STARTED">APPLICATION_STARTED</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="HUMAN_ACTION_REQUIRED">HUMAN_ACTION_REQUIRED</option>
            <option value="REVIEW_REQUIRED">REVIEW_REQUIRED</option>
            <option value="REJECTED">REJECTED</option>
          </select>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">All Application Routes</option>
            <option value="WEBSITE">WEBSITE</option>
            <option value="EMAIL">EMAIL</option>
            <option value="MANUAL">MANUAL</option>
          </select>
        </div>

        <button
          onClick={loadApplications}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition"
        >
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Company & Role</th>
                <th className="px-6 py-3.5">Route</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Tailored CV Used</th>
                <th className="px-6 py-3.5">Confirmation / Reference</th>
                <th className="px-6 py-3.5">Submitted Date</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-900 block">{app.jobTitle}</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Building className="w-3 h-3 text-slate-400" />
                      {app.company} • {app.jobLocation}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                      {app.applicationMethod === "EMAIL" ? (
                        <Mail className="w-3 h-3 text-slate-500" />
                      ) : (
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      )}
                      {app.applicationMethod}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        app.status === "CONFIRMED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : app.status === "SUBMITTED"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : app.status === "HUMAN_ACTION_REQUIRED"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : app.status === "REJECTED"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-800">
                    {app.cvTitle ? (
                      <a
                        href={app.cvPath}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 hover:underline truncate max-w-xs block"
                      >
                        {app.cvTitle}
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">Pending CV</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-700">
                    {app.confirmationId || app.emailMessageId || "—"}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {app.submittedAt ? new Date(app.submittedAt).toLocaleString() : "Not submitted"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/applications/${app.id}`}
                      className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition"
                    >
                      Audit View →
                    </Link>
                  </td>
                </tr>
              ))}
              {applications.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400 text-xs">
                    No applications match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
