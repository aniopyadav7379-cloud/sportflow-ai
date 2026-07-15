"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, X, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import useSWRImmutable from "swr/immutable";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { apiRequest, ApiError } from "@/lib/fetcher";

type Player = {
  id: string; name: string; jersey: number; position: string; overall: number;
  photoUrl?: string; club: { name: string }; team?: { name: string } | null;
};

type Paged = { items: Player[]; total: number; page: number; totalPages: number };

export default function PlayersPage() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);

  const { data, error, isLoading, mutate } = useSWR<Paged>(
    `/api/players?page=${page}&pageSize=12${query ? `&q=${encodeURIComponent(query)}` : ""}`
  );
  const { data: clubs } = useSWRImmutable<{ id: string; name: string }[]>("/api/clubs");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[13px] text-slate-500 dark:text-slate-400">{data?.total ?? "—"} players across all clubs and teams</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-brand-700"
        >
          <Plus size={15} /> Add Player
        </button>
      </div>

      <div className="card p-4">
        <div className="relative mb-4 max-w-sm">
          <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Search players..."
            className="input pl-8"
          />
        </div>

        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}
        {error && <ErrorState message={error.message} onRetry={() => mutate()} />}
        {data && data.items.length === 0 && <EmptyState title="No players found" description="Try a different search or add a new player." />}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data?.items.map((p) => (
            <Link
              key={p.id}
              href={`/players/${p.id}`}
              className="group rounded-xl border border-slate-100 p-4 transition-colors hover:border-brand-200 hover:bg-brand-50/40 dark:border-white/10 dark:hover:bg-brand-600/10"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-[14px] font-semibold text-brand-700 dark:bg-brand-600/20 dark:text-brand-300">
                  {p.name[0]}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-semibold text-slate-800 group-hover:text-brand-700 dark:text-slate-100">{p.name}</p>
                  <p className="truncate text-[11.5px] text-slate-500 dark:text-slate-400">{p.position} · #{p.jersey}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11.5px] text-slate-500 dark:text-slate-400">
                <span>{p.club.name}</span>
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-600">{p.overall}</span>
              </div>
            </Link>
          ))}
        </div>

        {data && data.totalPages > 1 && (
          <div className="mt-5 flex items-center justify-center gap-3">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-slate-200 p-1.5 disabled:opacity-40 dark:border-white/10">
              <ChevronLeft size={16} />
            </button>
            <span className="text-[12.5px] text-slate-600 dark:text-slate-300">Page {data.page} of {data.totalPages}</span>
            <button disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-slate-200 p-1.5 disabled:opacity-40 dark:border-white/10">
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreate && (
          <PlayerModal
            clubs={clubs ?? []}
            onClose={() => setShowCreate(false)}
            onCreated={() => { mutate(); setShowCreate(false); toast.success("Player added"); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function PlayerModal({ clubs, onClose, onCreated }: { clubs: { id: string; name: string }[]; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    name: "", jersey: 1, position: "Midfielder (CM)", age: 20, height: "5'10\" (178 cm)",
    weight: "72 kg", nationality: "India", clubId: clubs[0]?.id ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.clubId) { setError("Create a club first."); return; }
    setLoading(true);
    setError(null);
    try {
      await apiRequest("/api/players", "POST", form);
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create player.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#131a2e]" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white">Add Player</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input required placeholder="Full name" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <input required type="number" placeholder="Jersey #" className="input" value={form.jersey} onChange={(e) => setForm({ ...form, jersey: Number(e.target.value) })} />
            <input required type="number" placeholder="Age" className="input" value={form.age} onChange={(e) => setForm({ ...form, age: Number(e.target.value) })} />
          </div>
          <input required placeholder="Position" className="input" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
          <select required className="input" value={form.clubId} onChange={(e) => setForm({ ...form, clubId: e.target.value })}>
            <option value="" disabled>Select club</option>
            {clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-[12px] text-red-600 dark:bg-red-500/10">{error}</p>}
          <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-[13px] font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
            {loading && <Loader2 size={14} className="animate-spin" />} Add Player
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
