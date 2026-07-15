"use client";

import { useState } from "react";
import useSWR from "swr";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Handshake, Wallet, FileSignature, Plus, X, Loader2 } from "lucide-react";
import KpiCard from "@/components/ui/KpiCard";
import { SkeletonTableRows } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { apiRequest, ApiError } from "@/lib/fetcher";

type Sponsor = { id: string; company: string; package: string; startDate: string; endDate: string; value: number; status: string };

export default function SponsorshipsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const { data: sponsors, error, isLoading, mutate } = useSWR<Sponsor[]>("/api/sponsors");

  const totalValue = sponsors?.reduce((s, x) => s + x.value, 0) ?? 0;
  const active = sponsors?.filter((s) => s.status === "Active").length ?? 0;

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-brand-700">
          <Plus size={15} /> Add Sponsor
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard icon={Handshake} iconBg="#eef2ff" iconColor="#4f6bfd" value={String(active)} label="Active Sponsors" />
        <KpiCard icon={Wallet} iconBg="#ecfdf5" iconColor="#059669" value={`₹${(totalValue / 100000).toFixed(1)}L`} label="Total Value" />
        <KpiCard icon={FileSignature} iconBg="#faf5ff" iconColor="#9333ea" value={String(sponsors?.length ?? 0)} label="Contracts" />
        <KpiCard icon={Handshake} iconBg="#fff7ed" iconColor="#d97706" value={String(sponsors?.filter((s) => s.status === "Pending").length ?? 0)} label="Pending" />
      </div>

      <div className="card p-5">
        <h3 className="mb-3 text-[14px] font-semibold text-slate-900 dark:text-white">Sponsors</h3>
        {isLoading && <SkeletonTableRows rows={4} cols={5} />}
        {error && <ErrorState message={error.message} onRetry={() => mutate()} />}
        {sponsors && sponsors.length === 0 && <EmptyState title="No sponsors yet" description="Add your first sponsorship deal." />}
        {sponsors && sponsors.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[12.5px]">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400 dark:border-white/10">
                  <th className="pb-2 font-medium">Company</th><th className="pb-2 font-medium">Package</th>
                  <th className="pb-2 font-medium">End Date</th><th className="pb-2 font-medium">Value</th><th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {sponsors.map((s) => (
                  <tr key={s.id} className="border-b border-slate-50 last:border-0 dark:border-white/5">
                    <td className="py-3 font-medium text-slate-800 dark:text-slate-100">{s.company}</td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">{s.package}</td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">{new Date(s.endDate).toLocaleDateString()}</td>
                    <td className="py-3 font-semibold text-slate-900 dark:text-white">₹{s.value.toLocaleString()}</td>
                    <td className="py-3"><span className={`badge ${s.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>● {s.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreate && <SponsorModal onClose={() => setShowCreate(false)} onCreated={() => { mutate(); setShowCreate(false); toast.success("Sponsor added"); }} />}
      </AnimatePresence>
    </div>
  );
}

function SponsorModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ company: "", package: "", value: 100000, startDate: "", endDate: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiRequest("/api/sponsors", "POST", form);
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create sponsor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#131a2e]" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white">Add Sponsor</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input required placeholder="Company name" className="input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          <input required placeholder="Package (e.g. Title Sponsor)" className="input" value={form.package} onChange={(e) => setForm({ ...form, package: e.target.value })} />
          <input required type="number" placeholder="Value (₹)" className="input" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
          <div className="grid grid-cols-2 gap-3">
            <input required type="date" className="input" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            <input required type="date" className="input" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </div>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-[12px] text-red-600 dark:bg-red-500/10">{error}</p>}
          <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-[13px] font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
            {loading && <Loader2 size={14} className="animate-spin" />} Create Sponsor
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
