"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Layers, CheckCircle2, Building, Target } from "lucide-react";

export default function AnalyticsPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setData(d);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Recruitment Analytics & Insights</h1>
        <p className="text-sm text-slate-500 mt-1">
          Performance metrics, conversion funnel, response rates, and company distributions.
        </p>
      </div>

      {/* Top Ratios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-xs font-semibold text-slate-500 uppercase">Recruiter Response Rate</span>
          <div className="text-4xl font-extrabold text-indigo-600 mt-2">{data?.stats?.responseRate ?? 0}%</div>
          <span className="text-xs text-slate-400 mt-1 block">Interviews + Offers / Total Applications</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-xs font-semibold text-slate-500 uppercase">Interview Conversion Rate</span>
          <div className="text-4xl font-extrabold text-emerald-600 mt-2">{data?.stats?.interviewRate ?? 0}%</div>
          <span className="text-xs text-slate-400 mt-1 block">Candidates invited to interview stage</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-xs font-semibold text-slate-500 uppercase">Confirmed Applications</span>
          <div className="text-4xl font-extrabold text-blue-600 mt-2">{data?.stats?.confirmedCount ?? 0}</div>
          <span className="text-xs text-slate-400 mt-1 block">Successfully submitted with confirmation receipt</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Application Funnel</h2>
            <TrendingUp className="w-5 h-5 text-indigo-600" />
          </div>

          <div className="space-y-4 pt-2">
            {data?.charts?.statusFunnel?.map((item: any, idx: number) => {
              const max = data.charts.statusFunnel[0]?.count || 1;
              const pct = Math.max(10, Math.round((item.count / max) * 100));
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">{item.status}</span>
                    <span className="text-slate-900">{item.count}</span>
                  </div>
                  <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Company Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Top Employers Targeted</h2>
            <Building className="w-5 h-5 text-slate-400" />
          </div>

          <div className="space-y-3 pt-2">
            {data?.charts?.applicationsByCompany?.map((c: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-800">{c.name}</span>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                  {c.count} applications
                </span>
              </div>
            ))}
            {(!data?.charts?.applicationsByCompany || data.charts.applicationsByCompany.length === 0) && (
              <div className="text-center py-8 text-xs text-slate-400">No applications data to display.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
