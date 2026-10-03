"use client";

import { useEffect, useState } from "react";
import { FileText, Download, ExternalLink, ShieldCheck, History, Eye } from "lucide-react";

export default function CvManagerPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCvForPreview, setSelectedCvForPreview] = useState<any | null>(null);

  const fetchCvs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/cvs");
      const d = await res.json();
      if (d.success) {
        setData(d);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCvs();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">CV & Resume Version Manager</h1>
        <p className="text-sm text-slate-500 mt-1">
          Immutable Master CV and company-tailored ATS versions. Every generated CV version is archived and never overwritten.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Master CV Information */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Master CV (Canonical)</h2>
          </div>

          <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs space-y-2">
            <span className="font-bold text-indigo-900 block">Immutable Ground-Truth</span>
            <p className="text-indigo-800 leading-snug">
              The Master CV is preserved as the single source of truth. AI tailoring agents select and order relevant facts without modifying the master baseline.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {data?.masterCvs?.map((m: any) => (
              <div key={m.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>{m.title}</span>
                  <span className="text-indigo-600">v{m.versionNumber}</span>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Created: {new Date(m.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Tailored Generated CVs */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Application-Tailored CVs</h2>
              <p className="text-xs text-slate-500">Archived versions tailored for specific job listings</p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
              {data?.generatedCvs?.length || 0} Versions
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {data?.generatedCvs?.map((cv: any) => (
              <div key={cv.id} className="py-4 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">{cv.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span>Target: {cv.applications?.[0]?.job?.company || "Direct Portal"}</span>
                    <span>•</span>
                    <span className="font-mono text-[11px]">Hash: {cv.contentHash.slice(0, 10)}...</span>
                    <span>•</span>
                    <span>{new Date(cv.generatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedCvForPreview(cv)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>
                  {cv.pdfPath && (
                    <a
                      href={cv.pdfPath}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Document</span>
                    </a>
                  )}
                </div>
              </div>
            ))}

            {data?.generatedCvs?.length === 0 && !loading && (
              <div className="py-8 text-center text-xs text-slate-400">
                No tailored CVs generated yet. CVs are automatically generated during application preparation.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CV Preview Modal */}
      {selectedCvForPreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">{selectedCvForPreview.title}</h3>
              <button
                onClick={() => setSelectedCvForPreview(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 p-2 bg-slate-100">
              {selectedCvForPreview.pdfPath ? (
                <iframe
                  src={selectedCvForPreview.pdfPath}
                  className="w-full h-full bg-white rounded-xl shadow-sm"
                  title="CV Preview"
                />
              ) : (
                <div className="p-8 text-center text-xs text-slate-500">Document path unavailable</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
