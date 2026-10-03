"use client";

import { useEffect, useState } from "react";
import { Mail, CheckCircle2, Clock, Send, FileText } from "lucide-react";

export default function EmailManagerPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/emails")
      .then((res) => res.json())
      .then((d) => {
        if (d.success) setData(d);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Email Delivery System</h1>
        <p className="text-sm text-slate-500 mt-1">
          Direct email applications, follow-ups, and recruiter response tracking with delivery audit logs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Templates */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Email Templates</h2>
          </div>

          <div className="space-y-3">
            {data?.templates?.map((t: any) => (
              <div key={t.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <span className="font-bold text-slate-800 block">{t.name}</span>
                <span className="text-slate-500 block truncate">Subject: {t.subjectTemplate}</span>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">
                  {t.category}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sent Emails Log */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Dispatched Application Emails</h2>
              <p className="text-xs text-slate-500">Live delivery records with provider message IDs</p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
              {data?.emails?.length || 0} Sent
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {data?.emails?.map((mail: any) => (
              <div key={mail.id} className="py-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{mail.subject}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {mail.deliveryStatus}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>To: <strong>{mail.recipient}</strong></span>
                  <span>•</span>
                  <span>MsgID: <strong className="font-mono text-[11px]">{mail.providerMessageId || "—"}</strong></span>
                  <span>•</span>
                  <span>{new Date(mail.sentAt).toLocaleString()}</span>
                </div>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 line-clamp-2">
                  {mail.body}
                </p>
              </div>
            ))}

            {data?.emails?.length === 0 && !loading && (
              <div className="py-8 text-center text-xs text-slate-400">
                No emails sent yet. Applications with email route will dispatch here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
