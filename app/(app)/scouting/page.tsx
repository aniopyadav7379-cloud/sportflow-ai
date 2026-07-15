"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Users2, Star, Eye, CheckCircle2, Plus, X, Loader2 } from "lucide-react";
import KpiCard from "@/components/ui/KpiCard";
import { SkeletonTableRows } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { apiRequest, ApiError } from "@/lib/fetcher";

const STAGES = ["All", "Prospect", "Shortlisted", "OnTrial", "Signed", "Rejected"];
const potentialColor: Record<string, string> = {
  High: "bg-emerald-50 text-emerald-600", Medium: "bg-amber-50 text-amber-600", Low: "bg-red-50 text-red-600",
};

type ScoutedPlayer = {
  id: string; name: string; position: string; age: number; country: string; team: string;
  overall: number; potential: string; stage: string; strengths: string[];
};

export default function ScoutingPage() {
  const [stage, setStage] = useState("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const { data: players, error, isLoading, mutate } = useSWR<ScoutedPlayer[]>(`/api/scouting?stage=${stage}`);

  const selected = useMemo(() => players?.find((p) => p.id === selectedId) ?? players?.[0], [players, selectedId]);

  async function updateStage(id: string, newStage: string) {
    try {
      await apiRequest(`/api/scouting/${id}`, "PATCH", { stage: newStage });
      mutate();
      toast.success(`Moved to ${newStage}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-brand-700">
          <Plus size={15} /> Add Scouting Report
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard icon={Users2} iconBg="#eef2ff" iconColor="#4f6bfd" value={String(players?.length ?? 0)} label="Players Scouted" />
        <KpiCard icon={Star} iconBg="#fff7ed" iconColor="#d97706" value={String(players?.filter((p) => p.stage === "Shortlisted").length ?? 0)} label="Shortlisted" />
        <KpiCard icon={Eye} iconBg="#ecfdf5" iconColor="#059669" value={String(players?.filter((p) => p.stage === "OnTrial").length ?? 0)} label="On Trial" />
        <KpiCard icon={CheckCircle2} iconBg="#faf5ff" iconColor="#9333ea" value={String(players?.filter((p) => p.stage === "Signed").length ?? 0)} label="Signed" />
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {STAGES.map((s) => (
          <button key={s} onClick={() => setStage(s)} className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-[12.5px] font-medium ${stage === s ? "bg-brand-600 text-white" : "border border-slate-200 text-slate-600 dark:border-white/10 dark:text-slate-300"}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <div className="card p-4">
          {isLoading && <SkeletonTableRows rows={6} cols={6} />}
          {error && <ErrorState message={error.message} onRetry={() => mutate()} />}
          {players && players.length === 0 && <EmptyState title="No scouted players" description="Add a scouting report to get started." />}
          {players && players.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-[12.5px]">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400 dark:border-white/10">
                    <th className="pb-2 font-medium">Player</th><th className="pb-2 font-medium">Position</th>
                    <th className="pb-2 font-medium">Age</th><th className="pb-2 font-medium">Country</th>
                    <th className="pb-2 font-medium">Overall</th><th className="pb-2 font-medium">Stage</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((p) => (
                    <tr key={p.id} onClick={() => setSelectedId(p.id)} className={`cursor-pointer border-b border-slate-50 last:border-0 dark:border-white/5 ${selected?.id === p.id ? "bg-brand-50/60 dark:bg-brand-600/10" : "hover:bg-slate-50 dark:hover:bg-white/5"}`}>
                      <td className="flex items-center gap-2.5 py-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-[11px] font-semibold text-brand-700 dark:bg-brand-600/20 dark:text-brand-300">{p.name[0]}</div>
                        <div className="min-w-0"><p className="truncate font-medium text-slate-800 dark:text-slate-100">{p.name}</p><p className="truncate text-[10.5px] text-slate-500 dark:text-slate-400">{p.team}</p></div>
                      </td>
                      <td className="py-3"><span className="badge bg-slate-100 text-slate-600">{p.position}</span></td>
                      <td className="py-3 text-slate-600 dark:text-slate-300">{p.age}</td>
                      <td className="py-3 text-slate-600 dark:text-slate-300">{p.country}</td>
                      <td className="py-3"><span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-emerald-400 text-[11px] font-bold text-emerald-600">{p.overall}</span></td>
                      <td className="py-3"><span className={`badge ${potentialColor[p.potential]}`}>{p.stage}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selected && (
          <div className="card p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-brand-100 text-[20px] font-bold text-brand-700 dark:bg-brand-600/20 dark:text-brand-300">{selected.name[0]}</div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[15px] font-semibold text-slate-900 dark:text-white">{selected.name}</p>
                  <span className={`badge ${potentialColor[selected.potential]}`}>{selected.potential} Potential</span>
                </div>
                <p className="text-[11.5px] text-slate-500 dark:text-slate-400">{selected.team} · {selected.country}</p>
                <p className="text-[11px] text-slate-400">{selected.position} · Age {selected.age}</p>
              </div>
            </div>

            <div className="mb-4 rounded-xl bg-slate-50 p-4 text-center dark:bg-white/5">
              <p className="text-[24px] font-bold text-emerald-600">{selected.overall}<span className="text-[13px] text-slate-400">/100</span></p>
              <p className="text-[11.5px] font-medium text-slate-600 dark:text-slate-300">Overall Rating</p>
            </div>

            <h4 className="mb-2 text-[12.5px] font-semibold text-slate-900 dark:text-white">Key Strengths</h4>
            <div className="mb-4 flex flex-wrap gap-1.5">
              {selected.strengths.map((s) => <span key={s} className="badge bg-brand-50 text-brand-600">{s}</span>)}
            </div>

            <h4 className="mb-2 text-[12.5px] font-semibold text-slate-900 dark:text-white">Move Stage</h4>
            <div className="flex flex-wrap gap-2">
              {STAGES.filter((s) => s !== "All").map((s) => (
                <button key={s} onClick={() => updateStage(selected.id, s)} disabled={selected.stage === s} className={`rounded-lg px-2.5 py-1.5 text-[11.5px] font-medium ${selected.stage === s ? "bg-brand-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreate && <ScoutModal onClose={() => setShowCreate(false)} onCreated={() => { mutate(); setShowCreate(false); toast.success("Scouting report added"); }} />}
      </AnimatePresence>
    </div>
  );
}

function ScoutModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: "", position: "CM", age: 18, country: "India", team: "", overall: 70, potential: "Medium" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiRequest("/api/scouting", "POST", { ...form, strengths: [] });
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add report.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#131a2e]" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white">Add Scouting Report</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input required placeholder="Player name" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <input required placeholder="Position" className="input" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
            <input required type="number" placeholder="Age" className="input" value={form.age} onChange={(e) => setForm({ ...form, age: Number(e.target.value) })} />
          </div>
          <input required placeholder="Current team" className="input" value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })} />
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-[12px] text-red-600 dark:bg-red-500/10">{error}</p>}
          <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-[13px] font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
            {loading && <Loader2 size={14} className="animate-spin" />} Add Report
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
