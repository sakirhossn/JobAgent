"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  CheckCircle2,
  Send,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowUpRight,
  Building,
  TrendingUp,
  FileCheck,
  Mail,
  Award,
  Layers,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, appsRes] = await Promise.all([
        fetch("/api/analytics"),
        fetch("/api/applications"),
      ]);

      const analyticsData = await analyticsRes.json();
      const appsData = await appsRes.json();

      if (analyticsData.success) {
        setStats(analyticsData.stats);
        setCharts(analyticsData.charts);
      }
      if (appsData.success) {
        setRecentApplications(appsData.applications.slice(0, 6));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Recruitment Operations Center</h1>
          <p className="text-sm text-slate-500 mt-1">
            Autonomous discovery, ATS matching, truthful CV tailoring, and application execution.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition"
          >
            <span>Browse Jobs</span>
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
          </Link>
          <Link
            href="/human-actions"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 shadow-sm transition"
          >
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Human Action Center</span>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Discovered Jobs</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">{stats?.totalJobs ?? 0}</span>
            <span className="block text-xs text-slate-500 mt-1">Normalized across sources</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Eligible Matches</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">{stats?.eligibleJobs ?? 0}</span>
            <span className="block text-xs text-emerald-600 font-medium mt-1">Auto-Apply Qualified</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Applications Submitted</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">{stats?.confirmedCount ?? 0}</span>
            <span className="block text-xs text-slate-500 mt-1">
              Today: <strong className="text-slate-800">{stats?.applicationsToday ?? 0}</strong>
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Action Queue</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">{stats?.humanActions ?? 0}</span>
            <span className="block text-xs text-amber-600 font-medium mt-1">Human interventions</span>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 text-center">
          <span className="text-xs text-slate-500">Pending Approval</span>
          <p className="text-lg font-bold text-slate-800 mt-0.5">{stats?.pendingApproval ?? 0}</p>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 text-center">
          <span className="text-xs text-slate-500">Emails Sent</span>
          <p className="text-lg font-bold text-slate-800 mt-0.5">{stats?.emailsSent ?? 0}</p>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 text-center">
          <span className="text-xs text-slate-500">Interviews</span>
          <p className="text-lg font-bold text-indigo-600 mt-0.5">{stats?.interviewsCount ?? 0}</p>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 text-center">
          <span className="text-xs text-slate-500">Offers</span>
          <p className="text-lg font-bold text-emerald-600 mt-0.5">{stats?.offersCount ?? 0}</p>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 text-center">
          <span className="text-xs text-slate-500">Response Rate</span>
          <p className="text-lg font-bold text-slate-800 mt-0.5">{stats?.responseRate ?? 0}%</p>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 text-center">
          <span className="text-xs text-slate-500">Interview Rate</span>
          <p className="text-lg font-bold text-slate-800 mt-0.5">{stats?.interviewRate ?? 0}%</p>
        </div>
      </div>

      {/* Middle Row: Funnel & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Funnel */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Application Status Funnel</h2>
              <p className="text-xs text-slate-500">End-to-end recruitment conversion metrics</p>
            </div>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3 mt-4">
            {charts?.statusFunnel?.map((step: any, idx: number) => {
              const max = charts.statusFunnel[0]?.count || 1;
              const pct = Math.max(8, Math.round((step.count / max) * 100));
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700">{step.status}</span>
                    <span className="text-slate-900 font-bold">{step.count}</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        idx === 0
                          ? "bg-slate-400"
                          : idx === 1
                          ? "bg-indigo-500"
                          : idx === 2
                          ? "bg-blue-500"
                          : idx === 3
                          ? "bg-emerald-500"
                          : "bg-purple-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Roles Distribution */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Target Roles Activity</h2>
              <p className="text-xs text-slate-500">Applications by position</p>
            </div>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3 mt-2">
            {charts?.applicationsByRole && charts.applicationsByRole.length > 0 ? (
              charts.applicationsByRole.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-xs font-medium text-slate-800 truncate pr-2">{item.name}</span>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {item.count}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                Run pipeline to generate application statistics.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Recent Applications</h2>
            <p className="text-xs text-slate-500">Live applications tracked in the database</p>
          </div>
          <Link
            href="/applications"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
              <tr>
                <th className="px-6 py-3">Company & Role</th>
                <th className="px-6 py-3">Method</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Confirmation ID</th>
                <th className="px-6 py-3">Updated</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentApplications.map((app) => (
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
                  <td className="px-6 py-4 font-mono text-xs text-slate-600">
                    {app.confirmationId || "—"}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {new Date(app.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/applications/${app.id}`}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      Details →
                    </Link>
                  </td>
                </tr>
              ))}
              {recentApplications.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-xs text-slate-400">
                    No applications created yet. Click "Run AI Pipeline" in the top bar to begin.
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
