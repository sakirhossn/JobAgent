"use client";

import { useState } from "react";
import { Search, Play, CheckCircle2, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function Navbar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [runMessage, setRunMessage] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/jobs?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleTriggerPipeline = async () => {
    try {
      setIsRunning(true);
      setRunMessage("Running AI Discovery & Pipeline...");
      const res = await fetch("/api/pipeline/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "FULL_PIPELINE" }),
      });
      const data = await res.json();
      if (data.success) {
        setRunMessage(`Success: Processed ${data.summary?.discoveredJobsCount || 0} jobs.`);
        setTimeout(() => {
          setRunMessage(null);
          router.refresh();
        }, 3000);
      } else {
        setRunMessage(`Failed: ${data.error}`);
        setTimeout(() => setRunMessage(null), 4000);
      }
    } catch (err: any) {
      setRunMessage(`Error: ${err.message}`);
      setTimeout(() => setRunMessage(null), 4000);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Global Search Bar */}
      <form onSubmit={handleSearch} className="relative w-96">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Global search jobs, companies, skills, IDs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        />
      </form>

      {/* Action Controls & Indicators */}
      <div className="flex items-center gap-4">
        {runMessage && (
          <div className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
            {isRunning ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            )}
            <span>{runMessage}</span>
          </div>
        )}

        {/* Policy mode indicator */}
        <div className="hidden md:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
          <span className="h-2 w-2 rounded-full bg-amber-500"></span>
          Policy: APPROVAL_REQUIRED
        </div>

        {/* Autonomous Pipeline Run Trigger */}
        <button
          onClick={handleTriggerPipeline}
          disabled={isRunning}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-3.5 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all disabled:opacity-50"
        >
          {isRunning ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 text-indigo-200" />
          )}
          <span>{isRunning ? "Running Agent..." : "Run AI Pipeline"}</span>
        </button>
      </div>
    </header>
  );
}
