"use client";

import { useEffect, useState } from "react";
import {
  UserCheck,
  Building,
  GraduationCap,
  Wrench,
  Award,
  Globe,
  Save,
  CheckCircle2,
  AlertTriangle,
  FolderKanban,
} from "lucide-react";

export default function CandidateProfilePage() {
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currentCity, setCurrentCity] = useState("Kolkata");
  const [joiningDays, setJoiningDays] = useState(5);
  const [salaryMin, setSalaryMin] = useState(30000);
  const [salaryMax, setSalaryMax] = useState(40000);
  const [fresherStatus, setFresherStatus] = useState(true);
  const [targetJobTitlesStr, setTargetJobTitlesStr] = useState("");
  const [excludedJobTitlesStr, setExcludedJobTitlesStr] = useState("");
  const [preferredLocationsStr, setPreferredLocationsStr] = useState("");
  const [summary, setSummary] = useState("");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (data.success && data.profile) {
        const p = data.profile;
        setProfile(p);
        setFullName(p.fullName);
        setEmail(p.email);
        setPhone(p.phone);
        setCurrentCity(p.currentCity);
        setJoiningDays(p.joiningAvailabilityDays);
        setSalaryMin(p.salaryMinExpectation);
        setSalaryMax(p.salaryMaxExpectation);
        setFresherStatus(p.fresherStatus);
        setTargetJobTitlesStr(p.targetJobTitles.join(", "));
        setExcludedJobTitlesStr(p.excludedJobTitles.join(", "));
        setPreferredLocationsStr(p.preferredLocations.join(", "));
        setSummary(p.summary);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSaveSuccess(false);

      const targetJobTitles = targetJobTitlesStr.split(",").map((s) => s.trim()).filter(Boolean);
      const excludedJobTitles = excludedJobTitlesStr.split(",").map((s) => s.trim()).filter(Boolean);
      const preferredLocations = preferredLocationsStr.split(",").map((s) => s.trim()).filter(Boolean);

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          currentCity,
          joiningAvailabilityDays: Number(joiningDays),
          salaryMinExpectation: Number(salaryMin),
          salaryMaxExpectation: Number(salaryMax),
          fresherStatus,
          targetJobTitles,
          excludedJobTitles,
          preferredLocations,
          summary,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        fetchProfile();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading master candidate profile...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Master Candidate Profile</h1>
          <p className="text-sm text-slate-500 mt-1">
            Verified ground-truth profile. The AI never fabricates or hallucinates information beyond these records.
          </p>
        </div>
        {saveSuccess && (
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Profile successfully updated in database!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic & Preferences Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Personal & Target Job Preferences</h2>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving..." : "Save Preferences"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current City</label>
              <input
                type="text"
                value={currentCity}
                onChange={(e) => setCurrentCity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Joining Availability (Days)</label>
              <input
                type="number"
                value={joiningDays}
                onChange={(e) => setJoiningDays(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Salary Min (₹/month)</label>
              <input
                type="number"
                value={salaryMin}
                onChange={(e) => setSalaryMin(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Salary Max (₹/month)</label>
              <input
                type="number"
                value={salaryMax}
                onChange={(e) => setSalaryMax(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Job Titles (Comma-separated)
              </label>
              <input
                type="text"
                value={targetJobTitlesStr}
                onChange={(e) => setTargetJobTitlesStr(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                e.g. Data Analyst, IT, Supply Chain, Operations, Business Analyst
              </span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-rose-700 mb-1">
                Excluded Job Titles / Rules (Comma-separated)
              </label>
              <input
                type="text"
                value={excludedJobTitlesStr}
                onChange={(e) => setExcludedJobTitlesStr(e.target.value)}
                className="w-full bg-rose-50/50 border border-rose-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
              <span className="text-[11px] text-rose-600 mt-0.5 block">
                e.g. Chemical Engineering, Chemical Plant Engineer
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Preferred Locations (Comma-separated)
            </label>
            <input
              type="text"
              value={preferredLocationsStr}
              onChange={(e) => setPreferredLocationsStr(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Candidate Professional Summary</label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>
      </form>

      {/* Verified Sub-entities Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Education & Internships */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Verified Education & Internships</h3>
          </div>

          <div className="space-y-3">
            {profile?.education?.map((edu: any) => (
              <div key={edu.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <span className="font-bold text-slate-900 block">{edu.degree} in {edu.fieldOfStudy}</span>
                <span className="text-slate-600">{edu.institution} ({edu.startYear} - {edu.endYear || "Present"})</span>
                {edu.grade && <span className="block text-emerald-600 font-semibold mt-0.5">{edu.grade}</span>}
              </div>
            ))}

            {profile?.experience?.map((exp: any) => (
              <div key={exp.id} className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs">
                <span className="font-bold text-slate-900 block">
                  {exp.title} ({exp.isInternship ? "Internship" : "Full-time"})
                </span>
                <span className="text-slate-600">{exp.company} • {exp.startDate} to {exp.endDate || "Present"}</span>
                <p className="text-slate-700 mt-1 leading-snug">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Verified Skills & Projects */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Wrench className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">Verified Skills & Portfolios</h3>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-700 block mb-2">Verified Competencies:</span>
            <div className="flex flex-wrap gap-1.5">
              {profile?.skills?.map((s: any) => (
                <span
                  key={s.id}
                  className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200 font-medium"
                >
                  {s.name} ({s.proficiency.toLowerCase()})
                </span>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <span className="text-xs font-bold text-slate-700 block mb-2">Projects:</span>
            <div className="space-y-2">
              {profile?.projects?.map((p: any) => (
                <div key={p.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <span className="font-bold text-slate-900 block">{p.title}</span>
                  <p className="text-slate-600 mt-0.5">{p.description}</p>
                  <span className="text-indigo-600 font-medium block mt-1">Tech: {p.technologies.join(", ")}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
