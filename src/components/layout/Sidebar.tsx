"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Send,
  AlertTriangle,
  UserCheck,
  FileText,
  Mail,
  BarChart3,
  Settings,
  Terminal,
  ShieldCheck,
} from "lucide-react";
import { useState, useEffect } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const [pendingTasksCount, setPendingTasksCount] = useState<number>(0);

  useEffect(() => {
    fetch("/api/tasks?status=PENDING")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPendingTasksCount(data.tasks.length);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Discovered Jobs", href: "/jobs", icon: Briefcase },
    { label: "Applications", href: "/applications", icon: Send },
    {
      label: "Human Actions",
      href: "/human-actions",
      icon: AlertTriangle,
      badge: pendingTasksCount > 0 ? pendingTasksCount : null,
      badgeColor: "bg-amber-500",
    },
    { label: "Candidate Profile", href: "/profile", icon: UserCheck },
    { label: "CV Manager", href: "/cv-manager", icon: FileText },
    { label: "Email Manager", href: "/emails", icon: Mail },
    { label: "Analytics", href: "/analytics", icon: BarChart3 },
    { label: "Automation Rules", href: "/settings", icon: Settings },
    { label: "System Logs", href: "/logs", icon: Terminal },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800">
        <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-white text-base tracking-wide">JobPilot AI</span>
          <span className="block text-[10px] text-indigo-400 font-medium uppercase tracking-wider">
            Autonomous ATS Agent
          </span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && item.badge !== undefined && (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-bold text-white ${item.badgeColor || "bg-indigo-500"}`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Status */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Agent Engine: Online
          </span>
          <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">v1.0</span>
        </div>
        <p className="text-[11px] text-slate-400">Candidate: Sakir Hassain (Kolkata)</p>
      </div>
    </aside>
  );
}
