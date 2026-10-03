"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  SkipForward,
  ExternalLink,
  Building,
  Clock,
  HelpCircle,
  FileQuestion,
} from "lucide-react";

export default function HumanActionsPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING");
  const [activeTaskModal, setActiveTaskModal] = useState<any | null>(null);
  const [resolutionText, setResolutionText] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/tasks?status=${filter}`);
      const data = await res.json();
      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const handleTaskAction = async (taskId: string, action: string, resolutionNotes?: string) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, resolutionNotes }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Task marked as ${action}!`);
        setTimeout(() => setMessage(null), 3000);
        setActiveTaskModal(null);
        setResolutionText("");
        fetchTasks();
      }
    } catch (e: any) {
      setMessage(`Error: ${e.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Human Action Center</h1>
          <p className="text-sm text-slate-500 mt-1">
            Zero-hallucination safeguard queue. The AI halts application submission when encountering unverified questions, security barriers, or ambiguities.
          </p>
        </div>
        {message && (
          <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
            {message}
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        {["PENDING", "RESOLVED", "SKIPPED", "REJECTED", "ALL"].map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === st
                ? "bg-amber-500 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {st} Tasks
          </button>
        ))}
      </div>

      {/* Tasks Queue Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between space-y-4 hover:border-slate-300 transition"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    task.priority === "URGENT"
                      ? "bg-rose-100 text-rose-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {task.priority} PRIORITY
                </span>
                <span className="text-[11px] text-slate-400">
                  {new Date(task.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm">{task.title}</h3>
                <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <Building className="w-3 h-3 text-slate-400" />
                  {task.company || "Employer Portal"} • {task.jobTitle}
                </span>
              </div>

              <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-xl space-y-1">
                <span className="text-[11px] font-bold text-amber-900 block">Trigger Reason:</span>
                <p className="text-xs text-amber-800 leading-snug">{task.reason}</p>
              </div>

              <div className="text-xs text-slate-600">
                <strong>Required Action:</strong> {task.requiredAction}
              </div>
            </div>

            {/* Action Buttons */}
            {task.status === "PENDING" ? (
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => setActiveTaskModal(task)}
                  className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                >
                  Resolve
                </button>
                <button
                  onClick={() => handleTaskAction(task.id, "SKIP", "Skipped by admin")}
                  className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                >
                  Skip
                </button>
                <button
                  onClick={() => handleTaskAction(task.id, "REJECT", "Rejected application")}
                  className="py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold transition"
                >
                  Reject
                </button>
              </div>
            ) : (
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">Status: {task.status}</span>
                <button
                  onClick={() => handleTaskAction(task.id, "RETRY")}
                  className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Re-open</span>
                </button>
              </div>
            )}
          </div>
        ))}

        {tasks.length === 0 && !loading && (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No Human Actions in Queue</p>
            <p className="text-xs text-slate-400 mt-1">All applications are either automated or clear of ambiguities.</p>
          </div>
        )}
      </div>

      {/* Resolve Modal */}
      {activeTaskModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Resolve Human Intervention</h3>
              <button onClick={() => setActiveTaskModal(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p>
                <strong>Task:</strong> {activeTaskModal.title}
              </p>
              <p>
                <strong>Reason:</strong> {activeTaskModal.reason}
              </p>
              <p>
                <strong>Action Needed:</strong> {activeTaskModal.requiredAction}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Resolution Answer / Notes
              </label>
              <textarea
                rows={3}
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                placeholder="Enter verified response or manual resolution note..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setActiveTaskModal(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleTaskAction(activeTaskModal.id, "RESOLVE", resolutionText)}
                disabled={actionLoading}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                Confirm & Mark Resolved
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
