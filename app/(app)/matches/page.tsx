"use client";

import { useState } from "react";
import useSWR from "swr";
import useSWRImmutable from "swr/immutable";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Play, Clock, CalendarX2, PlusCircle, X, Loader2 } from "lucide-react";
import KpiCard from "@/components/ui/KpiCard";
import { SkeletonTableRows } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { apiRequest, ApiError } from "@/lib/fetcher";

const FILTERS = ["All Matches", "Live", "Upcoming", "Completed", "Cancelled"];

function statusBadge(status: string) {
  const map: Record<string, string> = {
    Live: "bg-red-50 text-red-600", Upcoming: "bg-amber-50 text-amber-600", Completed: "bg-emerald-50 text-emerald-600",
  };
  return map[status] ?? "bg-slate-100 text-slate-600";
}

type Match = {
  id: string; homeTeam: string; awayTeam: string; date: string; status: string;
  homeScore: number | null; awayScore: number | null;
  venue?: { name: string; location: string } | null; league?: { name: string } | null;
};

export default function MatchesPage() {
  const [filter, setFilter] = useState("All Matches");
  const [showCreate, setShowCreate] = useState(false);
  const { data: matches, error, isLoading, mutate } = useSWR<Match[]>(`/api/matches?status=${filter}`);
  const { data: venues } = useSWRImmutable<{ id: string; name: string }[]>("/api/venues");

  const counts = {
    total: matches?.length ?? 0,
    completed: matches?.filter((m) => m.status === "Completed").length ?? 0,
    upcoming: matches?.filter((m) => m.status === "Upcoming").length ?? 0,
    live: matches?.filter((m) => m.status === "Live").length ?? 0,
    cancelled: matches?.filter((m) => m.status === "Cancelled").length ?? 0,
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-brand-700">
          <PlusCircle size={15} /> Add Match
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <KpiCard icon={CalendarDays} iconBg="#eef2ff" iconColor="#4f6bfd" value={String(counts.total)} label="Total Matches" />
        <KpiCard icon={Play} iconBg="#ecfdf5" iconColor="#059669" value={String(counts.completed)} label="Completed" />
        <KpiCard icon={Clock} iconBg="#fff7ed" iconColor="#d97706" value={String(counts.upcoming)} label="Upcoming" />
        <KpiCard icon={Play} iconBg="#fff1f2" iconColor="#e11d48" value={String(counts.live)} label="Live Now" />
        <KpiCard icon={CalendarX2} iconBg="#f8fafc" iconColor="#64748b" value={String(counts.cancelled)} label="Cancelled" />
      </div>

      <div className="card p-4">
        <div className="mb-3 flex gap-2 overflow-x-auto">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-[12.5px] font-medium ${filter === f ? "bg-brand-600 text-white" : "border border-slate-200 text-slate-600 dark:border-white/10 dark:text-slate-300"}`}>
              {f}
            </button>
          ))}
        </div>

        {isLoading && <SkeletonTableRows rows={6} cols={6} />}
        {error && <ErrorState message={error.message} onRetry={() => mutate()} />}
        {matches && matches.length === 0 && <EmptyState title="No matches found" description="Schedule your first match." />}

        {matches && matches.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-[12.5px]">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400 dark:border-white/10">
                  <th className="pb-2 font-medium">Date</th><th className="pb-2 font-medium">Match</th>
                  <th className="pb-2 font-medium">League</th><th className="pb-2 font-medium">Venue</th>
                  <th className="pb-2 font-medium">Status</th><th className="pb-2 font-medium">Score</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m) => (
                  <tr key={m.id} className="border-b border-slate-50 last:border-0 dark:border-white/5">
                    <td className="py-3 text-slate-500 dark:text-slate-400">{new Date(m.date).toLocaleString()}</td>
                    <td className="py-3 font-medium text-slate-800 dark:text-slate-100">{m.homeTeam} vs {m.awayTeam}</td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">{m.league?.name ?? "—"}</td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">{m.venue?.name ?? "TBD"}</td>
                    <td className="py-3"><span className={`badge ${statusBadge(m.status)}`}>{m.status}</span></td>
                    <td className="py-3 font-semibold text-slate-900 dark:text-white">
                      {m.homeScore !== null ? `${m.homeScore} - ${m.awayScore}` : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreate && (
          <MatchModal venues={venues ?? []} onClose={() => setShowCreate(false)} onCreated={() => { mutate(); setShowCreate(false); toast.success("Match scheduled"); }} />
        )}
      </AnimatePresence>
    </div>
  );
}

function MatchModal({ venues, onClose, onCreated }: { venues: { id: string; name: string }[]; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ homeTeam: "", awayTeam: "", date: "", venueId: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiRequest("/api/matches", "POST", { ...form, venueId: form.venueId || undefined });
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to schedule match.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#131a2e]" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white">Add Match</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input required placeholder="Home team" className="input" value={form.homeTeam} onChange={(e) => setForm({ ...form, homeTeam: e.target.value })} />
            <input required placeholder="Away team" className="input" value={form.awayTeam} onChange={(e) => setForm({ ...form, awayTeam: e.target.value })} />
          </div>
          <input required type="datetime-local" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <select className="input" value={form.venueId} onChange={(e) => setForm({ ...form, venueId: e.target.value })}>
            <option value="">No venue selected</option>
            {venues.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-[12px] text-red-600 dark:bg-red-500/10">{error}</p>}
          <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-[13px] font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
            {loading && <Loader2 size={14} className="animate-spin" />} Schedule Match
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
