"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building,
  MapPin,
  Calendar,
  Send,
  FileText,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  AlertTriangle,
  History,
  FileCheck,
  HelpCircle,
} from "lucide-react";

export default function ApplicationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [app, setApp] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusInput, setStatusInput] = useState("");
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/applications/${params.id}`);
      const data = await res.json();
      if (data.success) {
        setApp(data.application);
        setStatusInput(data.application.status);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [params.id]);

  const handleUpdateStatus = async () => {
    try {
      setUpdating(true);
      const res = await fetch(`/api/applications/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusInput }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Status successfully updated and event logged!");
        setTimeout(() => setMessage(null), 3000);
        fetchApplication();
      }
    } catch (e: any) {
      setMessage(`Error: ${e.message}`);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading application audit record...</div>;
  }

  if (!app) {
    return <div className="p-8 text-center text-rose-500">Application not found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/applications"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Applications</span>
      </Link>

      {/* Main Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{app.job.title}</h1>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                app.status === "CONFIRMED"
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : app.status === "SUBMITTED"
                  ? "bg-blue-100 text-blue-800 border border-blue-300"
                  : app.status === "HUMAN_ACTION_REQUIRED"
                  ? "bg-amber-100 text-amber-800 border border-amber-300"
                  : "bg-slate-100 text-slate-800"
              }`}
            >
              {app.status}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-2">
            <span className="flex items-center gap-1 font-semibold text-slate-800">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              {app.job.company}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {app.job.location}
            </span>
            <span>•</span>
            <span>Route: <strong>{app.applicationMethod}</strong></span>
            {app.confirmationId && (
              <>
                <span>•</span>
                <span>Ref: <strong className="font-mono text-indigo-600">{app.confirmationId}</strong></span>
              </>
            )}
          </div>
        </div>

        {/* Status Override Control */}
        <div className="flex items-center gap-2">
          <select
            value={statusInput}
            onChange={(e) => setStatusInput(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800"
          >
            <option value="APPROVED">APPROVED</option>
            <option value="APPLICATION_STARTED">APPLICATION_STARTED</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="FOLLOW_UP">FOLLOW_UP</option>
            <option value="INTERVIEW">INTERVIEW</option>
            <option value="OFFER">OFFER</option>
            <option value="REJECTED">REJECTED</option>
            <option value="HUMAN_ACTION_REQUIRED">HUMAN_ACTION_REQUIRED</option>
          </select>
          <button
            onClick={handleUpdateStatus}
            disabled={updating || statusInput === app.status}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition"
          >
            {updating ? "Saving..." : "Update Status"}
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium">
          {message}
        </div>
      )}

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Submitted Facts & CV & Cover Letter */}
        <div className="lg:col-span-2 space-y-6">
          {/* Verified Answers Submitted */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Submitted Form Information</h2>
                <p className="text-xs text-slate-500">Every response verified against Master Candidate Profile</p>
              </div>
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>

            {app.answers && app.answers.length > 0 ? (
              <div className="space-y-3">
                {app.answers.map((ans: any) => (
                  <div key={ans.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-xs font-semibold text-slate-700 block">{ans.question}</span>
                    <span className="text-xs text-slate-900 font-medium mt-1 block">{ans.answer}</span>
                    <span className="text-[10px] text-emerald-600 font-mono mt-1 block">
                      ✓ Source: {ans.profileFieldSource || "Master Profile Verified"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-400 text-center">
                No custom portal form fields required (Direct application route).
              </div>
            )}
          </div>

          {/* Tailored CV Used */}
          {app.cvVersion && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Generated Tailored CV</h2>
                  <p className="text-xs text-slate-500">{app.cvVersion.title} (ATS Tailored Version)</p>
                </div>
                {app.cvVersion.pdfPath && (
                  <a
                    href={app.cvVersion.pdfPath}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Full Document</span>
                  </a>
                )}
              </div>

              {app.cvVersion.pdfPath && (
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-inner h-96">
                  <iframe src={app.cvVersion.pdfPath} className="w-full h-full bg-white" title="Tailored CV Preview" />
                </div>
              )}
            </div>
          )}

          {/* Generated Cover Letter */}
          {app.coverLetterText && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
              <h2 className="text-base font-bold text-slate-900">Tailored Cover Letter</h2>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-sans text-xs text-slate-800 whitespace-pre-wrap leading-relaxed select-text">
                {app.coverLetterText}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Immutable Activity Timeline */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Audit Event Timeline</h2>
                <p className="text-xs text-slate-500">Immutable ApplicationEvent ledger</p>
              </div>
              <History className="w-5 h-5 text-slate-400" />
            </div>

            <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {app.events.map((evt: any, i: number) => (
                <div key={evt.id} className="relative pl-7 space-y-1">
                  <span className="absolute left-2 top-1.5 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-white" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{evt.toStatus}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(evt.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-snug">{evt.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Confirmation & Reference Box */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Confirmation Evidence</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Reference ID:</span>
                <span className="font-mono font-bold text-slate-800">{app.confirmationId || "—"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Submitted At:</span>
                <span className="text-slate-800">
                  {app.submittedAt ? new Date(app.submittedAt).toLocaleString() : "—"}
                </span>
              </div>
              {app.emailRecipient && (
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Email Recipient:</span>
                  <span className="text-slate-800">{app.emailRecipient}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
