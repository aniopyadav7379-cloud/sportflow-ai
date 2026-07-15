"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Users2, User, Shield, X, Loader2 } from "lucide-react";
import KpiCard from "@/components/ui/KpiCard";
import { SkeletonCard, SkeletonTableRows } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { apiRequest, ApiError } from "@/lib/fetcher";

const TABS = ["Overview", "Teams", "Players", "Coaches", "Sponsors", "Venues", "Documents", "Settings"];

type Club = {
  id: string; name: string; city: string; country: string; founded: number;
  status: string; logoColor: string; description?: string; teamsCount: number; playersCount: number;
};

type ClubDetail = Club & {
  teams: { id: string; name: string; category: string; coach: string; matches: number; winPct: number; status: string; players: any[] }[];
};

export default function ClubsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("Overview");
  const [showCreate, setShowCreate] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);

  const { data: clubs, error, isLoading, mutate } = useSWR<Club[]>(
    `/api/clubs${query ? `?q=${encodeURIComponent(query)}` : ""}`
  );

  const activeId = selectedId ?? clubs?.[0]?.id ?? null;
  const { data: detail, mutate: mutateDetail } = useSWR<ClubDetail>(activeId ? `/api/clubs/${activeId}` : null);

  const totals = useMemo(() => {
    if (!clubs) return { teams: 0, players: 0 };
    return {
      teams: clubs.reduce((s, c) => s + c.teamsCount, 0),
      players: clubs.reduce((s, c) => s + c.playersCount, 0),
    };
  }, [clubs]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[13px] text-slate-500 dark:text-slate-400">Manage your clubs, teams, and their performance</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-brand-700"
        >
          <Plus size={15} /> Add New Club
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard icon={Shield} iconBg="#fff7ed" iconColor="#d97706" value={String(clubs?.length ?? 0)} label="Total Clubs" />
        <KpiCard icon={Users2} iconBg="#eef2ff" iconColor="#4f6bfd" value={String(totals.teams)} label="Total Teams" />
        <KpiCard icon={User} iconBg="#ecfdf5" iconColor="#059669" value={String(totals.players)} label="Total Players" />
        <KpiCard icon={User} iconBg="#fff1f2" iconColor="#e11d48" value="—" label="Coaches & Staff" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <div className="card p-4">
          <h3 className="mb-3 text-[14px] font-semibold text-slate-900 dark:text-white">All Clubs</h3>
          <div className="relative mb-3">
            <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search clubs..."
              className="input py-1.5 pl-8"
            />
          </div>

          {isLoading && <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}</div>}
          {error && <ErrorState message={error.message} onRetry={() => mutate()} />}
          {clubs && clubs.length === 0 && (
            <EmptyState title="No clubs yet" description="Create your first club to get started." />
          )}

          <div className="max-h-[600px] space-y-1 overflow-y-auto">
            {clubs?.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`flex w-full items-center gap-3 rounded-lg border-l-[3px] px-3 py-2.5 text-left transition-colors ${
                  activeId === c.id ? "border-brand-600 bg-brand-50 dark:bg-brand-600/10" : "border-transparent hover:bg-slate-50 dark:hover:bg-white/5"
                }`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white" style={{ backgroundColor: c.logoColor }}>
                  {c.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-[13px] font-medium ${activeId === c.id ? "text-brand-700 dark:text-brand-300" : "text-slate-800 dark:text-slate-100"}`}>
                    {c.name}
                  </p>
                  <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">{c.teamsCount} Teams · {c.playersCount} Players</p>
                </div>
                <span className={`shrink-0 text-[10px] font-medium ${c.status === "Active" ? "text-emerald-600" : "text-amber-600"}`}>● {c.status}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="card p-5">
          {!detail ? (
            <SkeletonTableRows rows={4} cols={4} />
          ) : (
            <>
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white" style={{ backgroundColor: detail.logoColor }}>
                    {detail.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[17px] font-semibold text-slate-900 dark:text-white">{detail.name}</h3>
                      <span className="badge bg-emerald-50 text-emerald-600">● {detail.status}</span>
                    </div>
                    <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">
                      📍 {detail.city}, {detail.country} · Founded: {detail.founded}
                    </p>
                    {detail.description && <p className="mt-2 max-w-xl text-[12.5px] text-slate-600 dark:text-slate-300">{detail.description}</p>}
                  </div>
                </div>
              </div>

              <div className="mb-4 flex gap-5 overflow-x-auto border-b border-slate-100 dark:border-white/10">
                {TABS.map((t) => (
                  <button key={t} onClick={() => setTab(t)} className={`tab-link whitespace-nowrap ${tab === t ? "active" : ""}`}>
                    {t}
                  </button>
                ))}
              </div>

              {tab === "Overview" || tab === "Teams" ? (
                <>
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-[14px] font-semibold text-slate-900 dark:text-white">Teams ({detail.teams.length})</h4>
                    <button
                      onClick={() => setShowTeamModal(true)}
                      className="flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-brand-700"
                    >
                      <Plus size={13} /> Add New Team
                    </button>
                  </div>
                  {detail.teams.length === 0 ? (
                    <EmptyState title="No teams yet" description="Add the first team for this club." />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[12.5px]">
                        <thead>
                          <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400 dark:border-white/10">
                            <th className="pb-2 font-medium">Team Name</th>
                            <th className="pb-2 font-medium">Category</th>
                            <th className="pb-2 font-medium">Coach</th>
                            <th className="pb-2 font-medium">Players</th>
                            <th className="pb-2 font-medium">Matches</th>
                            <th className="pb-2 font-medium">Wins</th>
                            <th className="pb-2 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detail.teams.map((t) => (
                            <tr key={t.id} className="border-b border-slate-50 last:border-0 dark:border-white/5">
                              <td className="py-3 font-medium text-slate-800 dark:text-slate-100">{t.name}</td>
                              <td className="py-3 text-slate-600 dark:text-slate-300">{t.category}</td>
                              <td className="py-3 text-slate-600 dark:text-slate-300">{t.coach}</td>
                              <td className="py-3 text-slate-600 dark:text-slate-300">{t.players?.length ?? 0}</td>
                              <td className="py-3 text-slate-600 dark:text-slate-300">{t.matches}</td>
                              <td className="py-3 font-medium text-emerald-600">{t.winPct}%</td>
                              <td className="py-3"><span className="badge bg-emerald-50 text-emerald-600">● {t.status}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex h-40 items-center justify-center text-[13px] text-slate-400">{tab} content coming soon.</div>
              )}
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showCreate && (
          <ClubModal
            onClose={() => setShowCreate(false)}
            onCreated={(club) => {
              mutate();
              setSelectedId(club.id);
              setShowCreate(false);
              toast.success(`${club.name} created`);
            }}
          />
        )}
        {showTeamModal && detail && (
          <TeamModal
            clubId={detail.id}
            onClose={() => setShowTeamModal(false)}
            onCreated={() => {
              mutateDetail();
              setShowTeamModal(false);
              toast.success("Team added");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#131a2e]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"><X size={18} /></button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

function ClubModal({ onClose, onCreated }: { onClose: () => void; onCreated: (c: Club) => void }) {
  const [form, setForm] = useState({ name: "", city: "", country: "India", founded: new Date().getFullYear() });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const club = await apiRequest<Club>("/api/clubs", "POST", form);
      onCreated(club);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create club.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title="Add New Club" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <input required placeholder="Club name" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <input required placeholder="City" className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <input required placeholder="Country" className="input" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
        </div>
        <input
          required type="number" placeholder="Founded year" className="input"
          value={form.founded} onChange={(e) => setForm({ ...form, founded: Number(e.target.value) })}
        />
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-[12px] text-red-600 dark:bg-red-500/10">{error}</p>}
        <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-[13px] font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
          {loading && <Loader2 size={14} className="animate-spin" />} Create Club
        </button>
      </form>
    </Modal>
  );
}

function TeamModal({ clubId, onClose, onCreated }: { clubId: string; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: "", category: "Senior Men", coach: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiRequest(`/api/clubs/${clubId}/teams`, "POST", form);
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create team.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title="Add New Team" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <input required placeholder="Team name" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input required placeholder="Category (e.g. U18, Senior Men)" className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <input required placeholder="Coach name" className="input" value={form.coach} onChange={(e) => setForm({ ...form, coach: e.target.value })} />
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-[12px] text-red-600 dark:bg-red-500/10">{error}</p>}
        <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-[13px] font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
          {loading && <Loader2 size={14} className="animate-spin" />} Add Team
        </button>
      </form>
    </Modal>
  );
}
