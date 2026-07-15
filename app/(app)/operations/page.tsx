"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, Users2, Plus, X, Loader2 } from "lucide-react";
import KpiCard from "@/components/ui/KpiCard";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { apiRequest, ApiError } from "@/lib/fetcher";

const DEPARTMENTS = ["Staff", "Equipment", "Transport", "Volunteers", "Medical", "Security"] as const;

type StaffMember = { id: string; name: string; department: string; role: string; status: string };

export default function OperationsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const { data: staff, error, isLoading, mutate } = useSWR<StaffMember[]>("/api/staff");

  const grouped = useMemo(() => {
    const map: Record<string, StaffMember[]> = {};
    DEPARTMENTS.forEach((d) => (map[d] = []));
    staff?.forEach((s) => map[s.department]?.push(s));
    return map;
  }, [staff]);

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-brand-700">
          <Plus size={15} /> Add Team Member
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard icon={Users2} iconBg="#eef2ff" iconColor="#4f6bfd" value={String(staff?.length ?? 0)} label="Total Personnel" />
        <KpiCard icon={ClipboardList} iconBg="#ecfdf5" iconColor="#059669" value={String(staff?.filter((s) => s.status === "Available").length ?? 0)} label="Available" />
        <KpiCard icon={ClipboardList} iconBg="#fff7ed" iconColor="#d97706" value={String(DEPARTMENTS.length)} label="Departments" />
        <KpiCard icon={Users2} iconBg="#faf5ff" iconColor="#9333ea" value={String(grouped["Medical"]?.length ?? 0)} label="Medical Staff" />
      </div>

      {isLoading && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}</div>}
      {error && <ErrorState message={error.message} onRetry={() => mutate()} />}
      {staff && staff.length === 0 && <EmptyState title="No personnel yet" description="Add staff, medical, security, or transport team members." />}

      {staff && staff.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DEPARTMENTS.map((d) => (
            <div key={d} className="card p-5">
              <p className="mb-3 text-[14px] font-semibold text-slate-900 dark:text-white">{d} ({grouped[d].length})</p>
              {grouped[d].length === 0 ? (
                <p className="text-[12px] text-slate-400">No members yet.</p>
              ) : (
                <div className="space-y-2">
                  {grouped[d].map((m) => (
                    <div key={m.id} className="flex items-center justify-between text-[12.5px]">
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-100">{m.name}</p>
                        <p className="text-[10.5px] text-slate-500 dark:text-slate-400">{m.role}</p>
                      </div>
                      <span className="badge bg-emerald-50 text-emerald-600">{m.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showCreate && <StaffModal onClose={() => setShowCreate(false)} onCreated={() => { mutate(); setShowCreate(false); toast.success("Team member added"); }} />}
      </AnimatePresence>
    </div>
  );
}

function StaffModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: "", department: "Staff", role: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiRequest("/api/staff", "POST", form);
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add member.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#131a2e]" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white">Add Team Member</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input required placeholder="Full name" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
            {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
          </select>
          <input required placeholder="Role" className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-[12px] text-red-600 dark:bg-red-500/10">{error}</p>}
          <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-[13px] font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
            {loading && <Loader2 size={14} className="animate-spin" />} Add Member
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
