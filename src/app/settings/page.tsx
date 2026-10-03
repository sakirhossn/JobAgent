"use client";

import { useEffect, useState } from "react";
import { Settings, Shield, Sliders, Save, CheckCircle2, AlertTriangle, Key } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Form values
  const [policyMode, setPolicyMode] = useState("APPROVAL_REQUIRED");
  const [maxDaily, setMaxDaily] = useState("10");
  const [aiProvider, setAiProvider] = useState("mock");
  const [autoApplyScore, setAutoApplyScore] = useState("75");
  const [reviewScore, setReviewScore] = useState("50");

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
        for (const s of data.settings) {
          if (s.key === "APPLICATION_POLICY") setPolicyMode(s.value);
          if (s.key === "MAX_DAILY_APPLICATIONS") setMaxDaily(s.value);
          if (s.key === "AI_PROVIDER") setAiProvider(s.value);
          if (s.key === "AUTO_APPLY_MIN_SCORE") setAutoApplyScore(s.value);
          if (s.key === "REVIEW_REQUIRED_MIN_SCORE") setReviewScore(s.value);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        APPLICATION_POLICY: policyMode,
        MAX_DAILY_APPLICATIONS: maxDaily,
        AI_PROVIDER: aiProvider,
        AUTO_APPLY_MIN_SCORE: autoApplyScore,
        REVIEW_REQUIRED_MIN_SCORE: reviewScore,
      };

      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("Settings and automation rules successfully saved!");
        setTimeout(() => setMessage(null), 3000);
        loadSettings();
      }
    } catch (e: any) {
      setMessage(`Error: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Automation Rules & Settings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure application submission policies, safety limits, matching thresholds, and AI engines.
          </p>
        </div>
        {message && (
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{message}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Application Policy Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Shield className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Application Submission Policy Mode</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label
              className={`p-4 rounded-xl border cursor-pointer transition ${
                policyMode === "APPROVAL_REQUIRED"
                  ? "bg-indigo-50/60 border-indigo-500 ring-2 ring-indigo-500/20"
                  : "bg-slate-50 border-slate-200 hover:bg-slate-100/50"
              }`}
            >
              <input
                type="radio"
                name="policy"
                value="APPROVAL_REQUIRED"
                checked={policyMode === "APPROVAL_REQUIRED"}
                onChange={(e) => setPolicyMode(e.target.value)}
                className="sr-only"
              />
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">APPROVAL_REQUIRED</span>
                <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                  Default
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Prepares tailored CV and validates questions, but pauses for administrator review and manual approval before submission.
              </p>
            </label>

            <label
              className={`p-4 rounded-xl border cursor-pointer transition ${
                policyMode === "AUTO"
                  ? "bg-indigo-50/60 border-indigo-500 ring-2 ring-indigo-500/20"
                  : "bg-slate-50 border-slate-200 hover:bg-slate-100/50"
              }`}
            >
              <input
                type="radio"
                name="policy"
                value="AUTO"
                checked={policyMode === "AUTO"}
                onChange={(e) => setPolicyMode(e.target.value)}
                className="sr-only"
              />
              <span className="font-bold text-sm text-slate-900 block">AUTO (Autonomous)</span>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Automatically submits applications meeting the AUTO_APPLY_ELIGIBLE threshold, stopping strictly on unknown questions or CAPTCHAs.
              </p>
            </label>

            <label
              className={`p-4 rounded-xl border cursor-pointer transition ${
                policyMode === "MANUAL"
                  ? "bg-indigo-50/60 border-indigo-500 ring-2 ring-indigo-500/20"
                  : "bg-slate-50 border-slate-200 hover:bg-slate-100/50"
              }`}
            >
              <input
                type="radio"
                name="policy"
                value="MANUAL"
                checked={policyMode === "MANUAL"}
                onChange={(e) => setPolicyMode(e.target.value)}
                className="sr-only"
              />
              <span className="font-bold text-sm text-slate-900 block">MANUAL</span>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Automation creates tasks in Human Action Center. Administrator executes all submissions manually.
              </p>
            </label>
          </div>
        </div>

        {/* Safety Limits & Thresholds */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sliders className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Safety Limits & Matching Thresholds</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Max Daily Applications Throttle
              </label>
              <input
                type="number"
                value={maxDaily}
                onChange={(e) => setMaxDaily(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Prevents spamming employer career endpoints
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Auto-Apply Min Score (%)
              </label>
              <input
                type="number"
                value={autoApplyScore}
                onChange={(e) => setAutoApplyScore(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">Default: 75% match threshold</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Review Required Min Score (%)
              </label>
              <input
                type="number"
                value={reviewScore}
                onChange={(e) => setReviewScore(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">Default: 50% match threshold</span>
            </div>
          </div>
        </div>

        {/* AI Engine Provider Abstraction */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Key className="w-5 h-5 text-purple-600" />
            <h2 className="text-base font-bold text-slate-900">AI Provider Abstraction</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Active AI Provider</label>
              <select
                value={aiProvider}
                onChange={(e) => setAiProvider(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="mock">Deterministic Built-in AI (Reliable / Zero Cost / Local)</option>
                <option value="gemini">Google Gemini AI (via GEMINI_API_KEY)</option>
              </select>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Pluggable engine: both enforce absolute data integrity & zero fabrication.
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving Changes..." : "Save All Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
