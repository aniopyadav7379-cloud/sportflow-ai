"use client";

import { useState } from "react";
import { CalendarDays, Dumbbell, MapPinned, AlertTriangle, ClipboardCheck, Plus } from "lucide-react";
import KpiCard from "@/components/ui/KpiCard";
import { scheduleEvents, scheduleConflicts } from "@/lib/data";

const VIEWS = ["Calendar View", "List View", "Team View"];

const TYPE_COLOR: Record<string, string> = {
  training: "bg-emerald-100 text-emerald-700 border-emerald-200",
  match: "bg-blue-100 text-blue-700 border-blue-200",
  analysis: "bg-purple-100 text-purple-700 border-purple-200",
  other: "bg-amber-100 text-amber-700 border-amber-200",
};

export default function SchedulingPage() {
  const [view, setView] = useState(VIEWS[0]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {VIEWS.map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded-lg px-3 py-1.5 text-[12.5px] font-medium ${
                view === v ? "bg-brand-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button className="rounded-lg border border-slate-200 px-3 py-2 text-[12.5px] font-medium text-slate-700 hover:bg-slate-50">
            Availability Overview
          </button>
          <button className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-700">
            <Plus size={15} /> Create New Schedule
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <KpiCard icon={CalendarDays} iconBg="#eef2ff" iconColor="#4f6bfd" value="48" label="Upcoming Fixtures" change={12} changeLabel="this week" />
        <KpiCard icon={Dumbbell} iconBg="#ecfdf5" iconColor="#059669" value="26" label="Training Sessions" change={6} changeLabel="this week" />
        <KpiCard icon={MapPinned} iconBg="#fff7ed" iconColor="#d97706" value="12" label="Venues Booked" change={3} changeLabel="today" />
        <KpiCard icon={AlertTriangle} iconBg="#fff1f2" iconColor="#e11d48" value="8" label="Conflicts Detected" />
        <KpiCard icon={ClipboardCheck} iconBg="#faf5ff" iconColor="#9333ea" value="92%" label="Utilization Rate" change={6} changeLabel="vs last week" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
        <div className="card overflow-x-auto p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[14px] font-semibold text-slate-900">13 – 19 May 2024</h3>
            <div className="flex gap-3 text-[11px] text-slate-500">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" /> Match</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Training</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-purple-500" /> Analysis</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Other</span>
            </div>
          </div>
          <div className="grid min-w-[800px] grid-cols-7 gap-2">
            {scheduleEvents.map((d) => (
              <div key={d.day} className="min-h-[420px] rounded-lg border border-slate-100 p-2">
                <p className="mb-1 text-[11.5px] font-semibold text-slate-700">{d.day}</p>
                {d.allDay && (
                  <p className="mb-2 truncate rounded bg-slate-100 px-1.5 py-1 text-[10px] font-medium text-slate-600">{d.allDay}</p>
                )}
                <div className="space-y-1.5">
                  {d.items.map((it, i) => (
                    <div key={i} className={`rounded-md border px-2 py-1.5 text-[10px] leading-tight ${TYPE_COLOR[it.type]}`}>
                      <p className="font-semibold">{it.title}</p>
                      <p className="opacity-80">{it.team}</p>
                      <p className="opacity-70">{it.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[13.5px] font-semibold text-slate-900">Schedule Conflicts</h3>
              <button className="text-[11px] font-medium text-brand-600">View All</button>
            </div>
            <div className="space-y-2.5">
              {scheduleConflicts.map((c) => (
                <div key={c.title} className="rounded-lg border border-slate-100 p-2.5">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <p className="text-[12px] font-medium text-slate-800">{c.title}</p>
                    <span
                      className={`shrink-0 badge ${
                        c.severity === "High"
                          ? "bg-red-50 text-red-600"
                          : c.severity === "Medium"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {c.severity}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-500">{c.date}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="mb-3 text-[13.5px] font-semibold text-slate-900">Facility Booking</h3>
            <div className="space-y-2.5 text-[12px]">
              {[
                { name: "Central Arena", time: "18 May · 7:00 AM - 9:00 AM" },
                { name: "Training Ground", time: "18 May · 7:30 AM - 9:00 AM" },
                { name: "Wellness Center", time: "18 May · 7:00 PM - 8:00 PM" },
              ].map((b) => (
                <div key={b.name} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800">{b.name}</p>
                    <p className="text-[10.5px] text-slate-500">{b.time}</p>
                  </div>
                  <span className="badge bg-emerald-50 text-emerald-600">Booked</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
