"use client";

import useSWR from "swr";
import { Users, User, CalendarDays, Ticket, Wallet, ArrowRight, Sparkles } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import KpiCard from "@/components/ui/KpiCard";
import DonutChart from "@/components/ui/DonutChart";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/EmptyState";
import { useSession } from "@/hooks/useSession";
import { performanceTrend, ticketSales, sponsorshipTrend, upcomingMatches, topPlayers } from "@/lib/data";

type Analytics = {
  clubs: number; players: number; matches: number; ticketsSold: number; ticketsTotal: number;
  sponsorshipRevenue: number; avgVenueUtilization: number;
};

export default function DashboardPage() {
  const { session } = useSession();
  const { data: analytics, error, isLoading, mutate } = useSWR<Analytics>("/api/analytics");

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B1330] via-[#141c42] to-[#1c2a5e] p-8">
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="flex flex-col justify-center">
            <h2 className="text-[28px] font-bold leading-tight text-white sm:text-[32px]">
              Manage. Analyze. Win.
              <br />
              AI-Powered Sports Operations Platform
            </h2>
            <p className="mt-3 max-w-lg text-[13.5px] text-slate-300">
              Everything you need to run your club, league, or tournament smarter and more efficiently.
            </p>
            <div className="mt-5 flex gap-3">
              <a href="/matches" className="rounded-lg bg-brand-600 px-5 py-2.5 text-[13.5px] font-semibold text-white hover:bg-brand-700">
                Create New Match
              </a>
              <a href="/analytics" className="rounded-lg border border-white/20 px-5 py-2.5 text-[13.5px] font-semibold text-white hover:bg-white/10">
                View Analytics
              </a>
            </div>
          </div>

          <div className="rounded-2xl bg-white/95 p-5 backdrop-blur">
            <div className="mb-3 flex items-center gap-2">
              <h3 className="text-[14px] font-semibold text-slate-900">AI Assistant</h3>
              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[9.5px] font-bold text-brand-600">BETA</span>
            </div>
            <p className="mb-3 text-[12.5px] text-slate-600">Hi {session?.name?.split(" ")[0] ?? "there"}! I can help you with:</p>
            <ul className="mb-4 space-y-2 text-[12.5px] text-slate-700">
              {["Schedule optimization", "Player performance analysis", "Injury risk prediction", "Scouting recommendations", "Sponsorship suggestions"].map((item) => (
                <li key={item} className="flex items-center gap-2"><Sparkles size={13} className="text-brand-500" /> {item}</li>
              ))}
            </ul>
            <a href="/assistant" className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
              <span className="flex-1 text-[12.5px] text-slate-400">Ask me anything...</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-600 text-white"><ArrowRight size={14} /></span>
            </a>
          </div>
        </div>
      </div>

      {error && <ErrorState message={error.message} onRetry={() => mutate()} />}

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <KpiCard icon={Users} iconBg="#eef2ff" iconColor="#4f6bfd" value={String(analytics?.clubs ?? 0)} label="Clubs" />
            <KpiCard icon={User} iconBg="#ecfdf5" iconColor="#059669" value={String(analytics?.players ?? 0)} label="Players" />
            <KpiCard icon={CalendarDays} iconBg="#fff7ed" iconColor="#d97706" value={String(analytics?.matches ?? 0)} label="Matches" />
            <KpiCard icon={Ticket} iconBg="#faf5ff" iconColor="#9333ea" value={(analytics?.ticketsSold ?? 0).toLocaleString()} label="Tickets Sold" />
            <KpiCard icon={Wallet} iconBg="#fff1f2" iconColor="#e11d48" value={`₹${((analytics?.sponsorshipRevenue ?? 0) / 100000).toFixed(1)}L`} label="Sponsorships" />
          </>
        )}
      </div>

      {/* Middle row */}
      <div className="grid gap-4 xl:grid-cols-[1fr_1.3fr_0.9fr]">
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[14.5px] font-semibold text-slate-900 dark:text-white">Upcoming Matches</h3>
            <a href="/matches" className="text-[12px] font-medium text-brand-600">View All</a>
          </div>
          <div className="space-y-3">
            {upcomingMatches.map((m) => (
              <div key={m.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-white/10">
                <div className="flex h-11 w-11 flex-col items-center justify-center rounded-lg bg-slate-100 text-[10px] font-bold leading-tight text-slate-600 dark:bg-white/5 dark:text-slate-300">
                  {m.date.split(" ")[0]}<span className="text-[13px]">{m.date.split(" ")[1]}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-slate-800 dark:text-slate-100">{m.home} vs {m.away}</p>
                  <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">{m.league} • {m.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="mb-2 text-[14.5px] font-semibold text-slate-900 dark:text-white">Performance Overview</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={performanceTrend}>
              <CartesianGrid stroke="#eef0f6" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Line type="monotone" dataKey="matches" stroke="#4f6bfd" strokeWidth={2} dot={false} name="Matches" />
              <Line type="monotone" dataKey="wins" stroke="#10b981" strokeWidth={2} dot={false} name="Wins" />
              <Line type="monotone" dataKey="goals" stroke="#a855f7" strokeWidth={2} dot={false} name="Goals" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[14.5px] font-semibold text-slate-900 dark:text-white">Top Players</h3>
            <a href="/players" className="text-[12px] font-medium text-brand-600">View All</a>
          </div>
          <div className="space-y-3">
            {topPlayers.map((p) => (
              <div key={p.rank} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-600 dark:bg-white/5 dark:text-slate-300">{p.rank}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-slate-800 dark:text-slate-100">{p.name}</p>
                  <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">{p.club}</p>
                </div>
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11.5px] font-semibold text-emerald-600">{p.rating}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="card p-5">
          <h3 className="mb-3 text-[14px] font-semibold text-slate-900 dark:text-white">Venue Utilization</h3>
          <div className="flex items-center justify-between">
            <DonutChart
              centerValue={`${analytics?.avgVenueUtilization ?? 0}%`}
              centerLabel="Utilized"
              data={[
                { name: "Utilized", value: analytics?.avgVenueUtilization ?? 0, color: "#4f6bfd" },
                { name: "Remaining", value: 100 - (analytics?.avgVenueUtilization ?? 0), color: "#e2e8f0" },
              ]}
            />
            <p className="text-[11.5px] text-slate-500 dark:text-slate-400">Average utilization across all registered venues.</p>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="mb-3 text-[14px] font-semibold text-slate-900 dark:text-white">Ticket Sales</h3>
          <p className="text-[22px] font-bold text-slate-900 dark:text-white">{(analytics?.ticketsSold ?? 0).toLocaleString()}</p>
          <p className="mb-2 text-[11px] text-slate-500 dark:text-slate-400">of {(analytics?.ticketsTotal ?? 0).toLocaleString()} total capacity</p>
          <ResponsiveContainer width="100%" height={110}>
            <BarChart data={ticketSales}>
              <Bar dataKey="value" fill="#4f6bfd" radius={[3, 3, 0, 0]} />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="mb-3 text-[14px] font-semibold text-slate-900 dark:text-white">Sponsorship Overview</h3>
          <p className="text-[22px] font-bold text-slate-900 dark:text-white">₹{((analytics?.sponsorshipRevenue ?? 0) / 100000).toFixed(2)}L</p>
          <p className="mb-2 text-[11px] text-slate-500 dark:text-slate-400">Total contracted value</p>
          <ResponsiveContainer width="100%" height={110}>
            <LineChart data={sponsorshipTrend}>
              <Line type="monotone" dataKey="value" stroke="#a855f7" strokeWidth={2} dot={false} />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="mb-3 text-[14px] font-semibold text-slate-900 dark:text-white">Platform Summary</h3>
          <div className="space-y-2.5 text-[12.5px]">
            <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Clubs</span><span className="font-semibold text-slate-800 dark:text-slate-100">{analytics?.clubs ?? 0}</span></div>
            <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Players</span><span className="font-semibold text-slate-800 dark:text-slate-100">{analytics?.players ?? 0}</span></div>
            <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Matches Scheduled</span><span className="font-semibold text-slate-800 dark:text-slate-100">{analytics?.matches ?? 0}</span></div>
            <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Avg Venue Utilization</span><span className="font-semibold text-slate-800 dark:text-slate-100">{analytics?.avgVenueUtilization ?? 0}%</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
