"use client";

import useSWR from "swr";
import { LineChart, Line, BarChart, Bar, XAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ErrorState } from "@/components/ui/EmptyState";
import { performanceTrend, ticketSales, sponsorshipTrend } from "@/lib/data";

const pieData = [
  { name: "Ticketing", value: 40, color: "#4f6bfd" },
  { name: "Sponsorships", value: 35, color: "#a855f7" },
  { name: "Merchandising", value: 15, color: "#10b981" },
  { name: "Other", value: 10, color: "#f59e0b" },
];

type Analytics = { clubs: number; players: number; matches: number; ticketsSold: number; sponsorshipRevenue: number; avgVenueUtilization: number };

export default function AnalyticsPage() {
  const { data, error, mutate } = useSWR<Analytics>("/api/analytics");

  return (
    <div className="space-y-5">
      {error && <ErrorState message={error.message} onRetry={() => mutate()} />}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Clubs", value: data?.clubs ?? 0 },
          { label: "Players", value: data?.players ?? 0 },
          { label: "Matches", value: data?.matches ?? 0 },
          { label: "Avg Venue Utilization", value: `${data?.avgVenueUtilization ?? 0}%` },
        ].map((k) => (
          <div key={k.label} className="card p-4">
            <p className="text-[20px] font-bold text-slate-900 dark:text-white">{k.value}</p>
            <p className="text-[12px] text-slate-500 dark:text-slate-400">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-3 text-[14px] font-semibold text-slate-900 dark:text-white">Team Performance</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={performanceTrend}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Line type="monotone" dataKey="wins" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="goals" stroke="#a855f7" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-5">
          <h3 className="mb-3 text-[14px] font-semibold text-slate-900 dark:text-white">Ticket Sales</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={ticketSales}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Bar dataKey="value" fill="#4f6bfd" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-3 text-[14px] font-semibold text-slate-900 dark:text-white">Revenue Breakdown</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={pieData} dataKey="value" innerRadius={45} outerRadius={70} paddingAngle={2}>
                  {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 text-[12px]">
              {pieData.map((d) => (
                <p key={d.name} className="flex items-center gap-1.5 dark:text-slate-300">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} /> {d.name} — {d.value}%
                </p>
              ))}
            </div>
          </div>
        </div>
        <div className="card p-5">
          <h3 className="mb-3 text-[14px] font-semibold text-slate-900 dark:text-white">Sponsorship Growth</h3>
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={sponsorshipTrend}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}