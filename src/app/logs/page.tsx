"use client";

import { useEffect, useState } from "react";
import { Terminal, AlertOctagon, History, CheckCircle2, RotateCcw } from "lucide-react";

export default function SystemLogsPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"RUNS" | "ERRORS" | "EVENTS">("RUNS");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/logs");
      const d = await res.json();
      if (d.success) setData(d);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System & Agent Observability Logs</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time execution traces for discovery agents, matching runs, transient error retries, and audit events.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition shadow-sm"
        >
          Refresh Logs
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("RUNS")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === "RUNS"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Agent Runs ({data?.agentRuns?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("ERRORS")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === "ERRORS"
              ? "bg-rose-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>Error Audit ({data?.errors?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("EVENTS")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === "EVENTS"
              ? "bg-slate-800 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Event Stream ({data?.recentEvents?.length || 0})</span>
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden">
        {activeTab === "RUNS" && (
          <div className="space-y-4">
            {data?.agentRuns?.map((run: any) => (
              <div key={run.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{run.agentName}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        run.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-800"
                          : run.status === "FAILED"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {run.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">{new Date(run.startedAt).toLocaleString()}</span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-600 font-mono">
                  <span>Processed: {run.itemsProcessed}</span>
                  <span>Succeeded: {run.itemsSucceeded}</span>
                  <span>Failed: {run.itemsFailed}</span>
                </div>

                {run.logs && (
                  <pre className="p-3 bg-slate-900 text-slate-200 rounded-lg text-[11px] font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                    {run.logs}
                  </pre>
                )}
              </div>
            ))}
            {data?.agentRuns?.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400">No agent runs recorded yet.</div>
            )}
          </div>
        )}

        {activeTab === "ERRORS" && (
          <div className="space-y-3">
            {data?.errors?.map((err: any) => (
              <div key={err.id} className="p-4 rounded-xl bg-rose-50/50 border border-rose-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-rose-900">
                    [{err.errorType}] {err.agentName}
                  </span>
                  <span className="text-[11px] text-rose-600">{new Date(err.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-xs text-rose-800 font-mono">{err.message}</p>
                {err.stackTrace && (
                  <pre className="p-2 bg-slate-900 text-rose-300 rounded text-[10px] font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {err.stackTrace}
                  </pre>
                )}
              </div>
            ))}
            {data?.errors?.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400">Zero error records. All runs healthy.</div>
            )}
          </div>
        )}

        {activeTab === "EVENTS" && (
          <div className="divide-y divide-slate-100">
            {data?.recentEvents?.map((evt: any) => (
              <div key={evt.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-slate-800">{evt.toStatus}</span>
                  <p className="text-xs text-slate-600 mt-0.5">{evt.message}</p>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Target: {evt.application?.job?.title} at {evt.application?.job?.company}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0">
                  {new Date(evt.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
            {data?.recentEvents?.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400">No recent events.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
