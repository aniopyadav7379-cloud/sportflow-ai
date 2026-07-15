"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Shield, CalendarDays, Plus, X, Loader2 } from "lucide-react";
import KpiCard from "@/components/ui/KpiCard";
import { SkeletonCard, SkeletonTableRows } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { apiRequest, ApiError } from "@/lib/fetcher";

type League = { id: string; name: string; sport: string; matchday: string; status: string; progress: number; _count: { matches: number } };
type StandingsRow = { id: string; team: string; played: number; won: number; drawn: number; lost: number; goalsFor: number; goalsAgainst: number; points: number; form: string[] };
type TopScorer = { rank: number; playerId: string; name: string; club: string; goals: number; assists: number };

export default function LeaguesPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [showRowModal, setShowRowModal] = useState(false);
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null);

  const { data: leagues, error, isLoading, mutate } = useSWR<League[]>("/api/leagues");
  const activeLeagueId = selectedLeagueId ?? leagues?.[0]?.id ?? null;

  useEffect(() => {
    if (!selectedLeagueId && leagues?.[0]) setSelectedLeagueId(leagues[0].id);
  }, [leagues, selectedLeagueId]);

  const { data: standings, mutate: mutateStandings } = useSWR<StandingsRow[]>(
    activeLeagueId ? `/api/leagues/${activeLeagueId}/standings` : null
  );
  const { data: topScorers } = useSWR<TopScorer[]>(
    activeLeagueId ? `/api/leagues/${activeLeagueId}/top-scorers` : null
  );

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-brand-700">
          <Plus size={15} /> Create New League
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard icon={Trophy} iconBg="#fff7ed" iconColor="#d97706" value={String(leagues?.length ?? 0)} label="Total Leagues" />
        <KpiCard icon={Shield} iconBg="#eef2ff" iconColor="#4f6bfd" value={String(leagues?.filter((l) => l.status === "Live").length ?? 0)} label="Live Now" />
        <KpiCard icon={CalendarDays} iconBg="#ecfdf5" iconColor="#059669" value={String(leagues?.reduce((s, l) => s + l._count.matches, 0) ?? 0)} label="Matches Played" />
        <KpiCard icon={Trophy} iconBg="#faf5ff" iconColor="#9333ea" value={String(standings?.length ?? 0)} label="Teams in Selected League" />
      </div>

      <div className="card p-5">
        <h3 className="mb-3 text-[14px] font-semibold text-slate-900 dark:text-white">Active Leagues</h3>
        {isLoading && <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</div>}
        {error && <ErrorState message={error.message} onRetry={() => mutate()} />}
        {leagues && leagues.length === 0 && <EmptyState title="No leagues yet" description="Create your first league or tournament." />}
        <div className="space-y-3">
          {leagues?.map((l) => (
            <button
              key={l.id}
              onClick={() => setSelectedLeagueId(l.id)}
              className={`w-full rounded-xl border p-3 text-left transition-colors ${
                activeLeagueId === l.id ? "border-brand-400 bg-brand-50/60 dark:bg-brand-600/10" : "border-slate-100 dark:border-white/10"
              }`}
            >
              <div className="mb-1.5 flex items-center justify-between">
                <p className="text-[13px] font-medium text-slate-800 dark:text-slate-100">{l.name}</p>
                <span className="badge bg-emerald-50 text-emerald-600">{l.status}</span>
              </div>
              <p className="mb-2 text-[11px] text-slate-500 dark:text-slate-400">{l.sport} · Matchday {l.matchday} · {l._count.matches} matches</p>
              <div className="h-1.5 rounded-full bg-slate-100 dark:bg-white/10">
                <div className="h-1.5 rounded-full bg-brand-500" style={{ width: `${l.progress}%` }} />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[14px] font-semibold text-slate-900 dark:text-white">League Table</h3>
            {activeLeagueId && (
              <button onClick={() => setShowRowModal(true)} className="flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-brand-700">
                <Plus size={13} /> Add / Update Team Row
              </button>
            )}
          </div>
          {!standings ? (
            <SkeletonTableRows rows={5} cols={7} />
          ) : standings.length === 0 ? (
            <EmptyState title="No standings yet" description="Add the first team row for this league." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-[12.5px]">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400 dark:border-white/10">
                    <th className="pb-2 font-medium">Team</th><th className="pb-2 font-medium">P</th><th className="pb-2 font-medium">W</th>
                    <th className="pb-2 font-medium">D</th><th className="pb-2 font-medium">L</th><th className="pb-2 font-medium">GD</th>
                    <th className="pb-2 font-medium">Pts</th><th className="pb-2 font-medium">Form</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((r) => (
                    <tr key={r.id} className="border-b border-slate-50 last:border-0 dark:border-white/5">
                      <td className="py-3 font-medium text-slate-800 dark:text-slate-100">{r.team}</td>
                      <td className="py-3 text-slate-600 dark:text-slate-300">{r.played}</td>
                      <td className="py-3 text-slate-600 dark:text-slate-300">{r.won}</td>
                      <td className="py-3 text-slate-600 dark:text-slate-300">{r.drawn}</td>
                      <td className="py-3 text-slate-600 dark:text-slate-300">{r.lost}</td>
                      <td className="py-3 text-slate-600 dark:text-slate-300">{r.goalsFor - r.goalsAgainst > 0 ? "+" : ""}{r.goalsFor - r.goalsAgainst}</td>
                      <td className="py-3 font-semibold text-slate-900 dark:text-white">{r.points}</td>
                      <td className="py-3">
                        <div className="flex gap-1">
                          {r.form.map((f, i) => (
                            <span key={i} className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white ${f === "W" ? "bg-emerald-500" : f === "D" ? "bg-slate-400" : "bg-red-500"}`}>{f}</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card p-5">
          <h3 className="mb-3 text-[14px] font-semibold text-slate-900 dark:text-white">Top Scorers</h3>
          {!topScorers ? (
            <SkeletonTableRows rows={5} cols={2} />
          ) : topScorers.length === 0 ? (
            <EmptyState title="No stats recorded yet" description="Add player match stats to populate top scorers." />
          ) : (
            <div className="space-y-3">
              {topScorers.map((s) => (
                <div key={s.playerId} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-600 dark:bg-white/5 dark:text-slate-300">{s.rank}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-slate-800 dark:text-slate-100">{s.name}</p>
                    <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">{s.club}</p>
                  </div>
                  <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[11.5px] font-semibold text-brand-600">{s.goals}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showCreate && <LeagueModal onClose={() => setShowCreate(false)} onCreated={() => { mutate(); setShowCreate(false); toast.success("League created"); }} />}
        {showRowModal && activeLeagueId && (
          <StandingsRowModal
            leagueId={activeLeagueId}
            onClose={() => setShowRowModal(false)}
            onSaved={() => { mutateStandings(); setShowRowModal(false); toast.success("Standings updated"); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function LeagueModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: "", sport: "Football", matchday: "1 / 38" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiRequest("/api/leagues", "POST", form);
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create league.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#131a2e]" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white">Create League</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input required placeholder="League name" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input required placeholder="Sport" className="input" value={form.sport} onChange={(e) => setForm({ ...form, sport: e.target.value })} />
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-[12px] text-red-600 dark:bg-red-500/10">{error}</p>}
          <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-[13px] font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
            {loading && <Loader2 size={14} className="animate-spin" />} Create League
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

function StandingsRowModal({ leagueId, onClose, onSaved }: { leagueId: string; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ team: "", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiRequest(`/api/leagues/${leagueId}/standings`, "POST", { ...form, form: [] });
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save row.");
    } finally {
      setLoading(false);
    }
  }

  const numField = (key: keyof typeof form, label: string) => (
    <input
      required type="number" placeholder={label} className="input"
      value={form[key]} onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })}
    />
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#131a2e]" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white">Add / Update Team Row</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input required placeholder="Team name" className="input" value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })} />
          <div className="grid grid-cols-4 gap-2">
            {numField("played", "P")}{numField("won", "W")}{numField("drawn", "D")}{numField("lost", "L")}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {numField("goalsFor", "GF")}{numField("goalsAgainst", "GA")}{numField("points", "Pts")}
          </div>
          <p className="text-[11px] text-slate-400">Saving a row with an existing team name updates that row instead of duplicating it.</p>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-[12px] text-red-600 dark:bg-red-500/10">{error}</p>}
          <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-[13px] font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
            {loading && <Loader2 size={14} className="animate-spin" />} Save Row
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
