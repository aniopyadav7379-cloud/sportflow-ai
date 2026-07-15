"use client";

import { useState } from "react";
import useSWR from "swr";
import toast from "react-hot-toast";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronDown, Plus, X, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { SkeletonTableRows } from "@/components/ui/Skeleton";
import { ErrorState, EmptyState } from "@/components/ui/EmptyState";
import { apiRequest, ApiError } from "@/lib/fetcher";

const TABS = ["Overview", "Statistics", "Performance", "Training", "Medical", "Contracts", "Match History"];

const ATTRIBUTES = {
  technical: [
    { label: "Passing", value: 84 }, { label: "Dribbling", value: 78 },
    { label: "Shooting", value: 72 }, { label: "Ball Control", value: 86 }, { label: "Crossing", value: 69 },
  ],
  mental: [
    { label: "Vision", value: 85 }, { label: "Decision Making", value: 82 },
    { label: "Aggression", value: 76 }, { label: "Positioning", value: 80 }, { label: "Teamwork", value: 88 },
  ],
};

type PlayerDetail = {
  id: string; name: string; jersey: number; position: string; age: number; height: string; weight: string;
  foot: string; nationality: string; overall: number; fitness: number; form: string; matches: number;
  goals: number; assists: number; marketValue: string; club: { name: string }; team?: { name: string } | null;
};

type MatchStat = { id: string; opponent: string; date: string; scoreLine: string; rating: number; goals: number; assists: number; minutes: number };

export default function PlayerProfilePage() {
  const params = useParams<{ playerId: string }>();
  const [tab, setTab] = useState("Overview");
  const [showStatModal, setShowStatModal] = useState(false);

  const { data: player, error, isLoading, mutate } = useSWR<PlayerDetail>(`/api/players/${params.playerId}`);
  const { data: stats, mutate: mutateStats } = useSWR<MatchStat[]>(`/api/players/${params.playerId}/stats?limit=10`);

  if (isLoading) return <SkeletonTableRows rows={8} cols={4} />;
  if (error || !player) return <ErrorState message={error?.message ?? "Player not found"} onRetry={() => mutate()} />;

  const chartData = (stats ?? [])
    .slice()
    .reverse()
    .map((s) => ({ date: new Date(s.date).toLocaleDateString(undefined, { day: "2-digit", month: "short" }), rating: s.rating }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Link href="/players" className="flex items-center gap-1.5 text-[13px] font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
          <ArrowLeft size={15} /> Back to Players
        </Link>
        <button onClick={() => setShowStatModal(true)} className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-[12.5px] font-semibold text-white hover:bg-brand-700">
          <Plus size={14} /> Log Match Stat
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex flex-wrap items-start gap-5">
              <div className="flex h-28 w-28 items-center justify-center rounded-xl bg-brand-100 text-[32px] font-bold text-brand-700 dark:bg-brand-600/20 dark:text-brand-300">
                {player.name[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-[19px] font-semibold text-slate-900 dark:text-white">{player.name}</h2>
                  <span className="badge bg-emerald-50 text-emerald-600">● Active</span>
                </div>
                <p className="text-[12.5px] text-slate-500 dark:text-slate-400">
                  {player.position} · {player.club.name}{player.team ? ` - ${player.team.name}` : ""}
                </p>
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[12px] text-slate-600 dark:text-slate-300">
                  <span>📅 {player.age} Years</span>
                  <span>📏 {player.height}</span>
                  <span>⚖️ {player.weight}</span>
                  <span>🦶 {player.foot} Footed</span>
                </div>
              </div>
              <div className="rounded-xl border border-slate-100 px-4 py-3 text-right dark:border-white/10">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Market Value</p>
                <p className="text-[18px] font-bold text-slate-900 dark:text-white">{player.marketValue}</p>
              </div>
            </div>

            <div className="mt-4 flex gap-5 overflow-x-auto border-b border-slate-100 dark:border-white/10">
              {TABS.map((t) => (
                <button key={t} onClick={() => setTab(t)} className={`tab-link whitespace-nowrap ${tab === t ? "active" : ""}`}>{t}</button>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {[
                { label: "Overall Rating", value: player.overall },
                { label: "Fitness Score", value: `${player.fitness}%` },
                { label: "Form", value: player.form },
                { label: "Matches Played", value: player.matches },
                { label: "Goals / Assists", value: `${player.goals} / ${player.assists}` },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-slate-100 p-3 dark:border-white/10">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{s.label}</p>
                  <p className="text-[16px] font-bold text-slate-900 dark:text-white">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-[13.5px] font-semibold text-slate-900 dark:text-white">Performance Trend</h3>
              <button className="flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[11px] text-slate-600 dark:border-white/10 dark:text-slate-300">
                Last {chartData.length || 0} Matches <ChevronDown size={12} />
              </button>
            </div>
            {chartData.length === 0 ? (
              <EmptyState title="No match stats logged yet" description="Log this player's first match performance." />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid stroke="#eef0f6" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Line type="monotone" dataKey="rating" stroke="#4f6bfd" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="card p-5">
            <h3 className="mb-3 text-[13.5px] font-semibold text-slate-900 dark:text-white">Attributes</h3>
            <div className="grid gap-6 sm:grid-cols-2">
              {(["technical", "mental"] as const).map((key) => (
                <div key={key} className="space-y-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{key}</p>
                  {ATTRIBUTES[key].map((a) => (
                    <div key={a.label}>
                      <div className="mb-1 flex justify-between text-[11.5px] text-slate-600 dark:text-slate-300">
                        <span>{a.label}</span><span className="font-medium">{a.value}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 dark:bg-white/10">
                        <div className={`h-1.5 rounded-full ${key === "technical" ? "bg-brand-500" : "bg-emerald-500"}`} style={{ width: `${a.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="mb-3 text-[13.5px] font-semibold text-slate-900 dark:text-white">Recent Matches</h3>
            {!stats || stats.length === 0 ? (
              <EmptyState title="No matches logged" description="Log a match stat to start building this player's history." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[12.5px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400 dark:border-white/10">
                      <th className="pb-2 font-medium">Date</th><th className="pb-2 font-medium">Opponent</th>
                      <th className="pb-2 font-medium">Score</th><th className="pb-2 font-medium">Rating</th><th className="pb-2 font-medium">Stats</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.map((m) => (
                      <tr key={m.id} className="border-b border-slate-50 last:border-0 dark:border-white/5">
                        <td className="py-2.5 text-slate-500 dark:text-slate-400">{new Date(m.date).toLocaleDateString()}</td>
                        <td className="py-2.5 text-slate-800 dark:text-slate-100">{m.opponent}</td>
                        <td className="py-2.5 text-slate-600 dark:text-slate-300">{m.scoreLine}</td>
                        <td className="py-2.5"><span className="badge bg-emerald-50 text-emerald-600">{m.rating}</span></td>
                        <td className="py-2.5 text-slate-500 dark:text-slate-400">
                          {m.goals > 0 && `${m.goals} Goal${m.goals > 1 ? "s" : ""}`}
                          {m.goals > 0 && m.assists > 0 && ", "}
                          {m.assists > 0 && `${m.assists} Assist${m.assists > 1 ? "s" : ""}`}
                          {m.goals === 0 && m.assists === 0 && `${m.minutes} Min`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="mb-3 text-[13.5px] font-semibold text-slate-900 dark:text-white">Player Bio</h3>
            <dl className="space-y-2 text-[12px]">
              {[
                ["Full Name", player.name], ["Nationality", player.nationality], ["Preferred Foot", player.foot],
                ["Position", player.position], ["Jersey Number", String(player.jersey)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <dt className="text-slate-500 dark:text-slate-400">{k}</dt>
                  <dd className="font-medium text-slate-800 dark:text-slate-100">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="card p-5">
            <h3 className="mb-3 text-[13.5px] font-semibold text-slate-900 dark:text-white">Availability</h3>
            <div className="space-y-2 text-[12px]">
              <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Fitness Status</span><span className="badge bg-emerald-50 text-emerald-600">● Fit</span></div>
              <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Injury Status</span><span className="badge bg-slate-100 text-slate-600">None</span></div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showStatModal && (
          <StatModal
            playerId={player.id}
            onClose={() => setShowStatModal(false)}
            onSaved={() => { mutateStats(); mutate(); setShowStatModal(false); toast.success("Match stat logged"); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function StatModal({ playerId, onClose, onSaved }: { playerId: string; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ opponent: "", date: "", scoreLine: "", rating: 7, goals: 0, assists: 0, minutes: 90 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiRequest(`/api/players/${playerId}/stats`, "POST", form);
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to log stat.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#131a2e]" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white">Log Match Stat</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input required placeholder="Opponent" className="input" value={form.opponent} onChange={(e) => setForm({ ...form, opponent: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <input required type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <input required placeholder="Score e.g. 2 - 1" className="input" value={form.scoreLine} onChange={(e) => setForm({ ...form, scoreLine: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input required type="number" step="0.1" placeholder="Rating" className="input" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} />
            <input required type="number" placeholder="Goals" className="input" value={form.goals} onChange={(e) => setForm({ ...form, goals: Number(e.target.value) })} />
            <input required type="number" placeholder="Assists" className="input" value={form.assists} onChange={(e) => setForm({ ...form, assists: Number(e.target.value) })} />
          </div>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-[12px] text-red-600 dark:bg-red-500/10">{error}</p>}
          <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-[13px] font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
            {loading && <Loader2 size={14} className="animate-spin" />} Save Stat
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
