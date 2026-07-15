"use client";

import { useState } from "react";
import useSWR from "swr";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Ticket, Wallet, Percent, Plus, X, Loader2 } from "lucide-react";
import KpiCard from "@/components/ui/KpiCard";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { apiRequest, ApiError } from "@/lib/fetcher";

type TicketType = { id: string; type: string; price: number; quantity: number; sold: number };

export default function TicketingPage() {
  const [showCreate, setShowCreate] = useState(false);
  const { data: tickets, error, isLoading, mutate } = useSWR<TicketType[]>("/api/tickets");

  const totalSold = tickets?.reduce((s, t) => s + t.sold, 0) ?? 0;
  const totalRevenue = tickets?.reduce((s, t) => s + t.sold * t.price, 0) ?? 0;
  const totalQty = tickets?.reduce((s, t) => s + t.quantity, 0) ?? 0;
  const occupancy = totalQty ? Math.round((totalSold / totalQty) * 100) : 0;

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-brand-700">
          <Plus size={15} /> Add Ticket Type
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard icon={Ticket} iconBg="#eef2ff" iconColor="#4f6bfd" value={totalSold.toLocaleString()} label="Tickets Sold" />
        <KpiCard icon={Wallet} iconBg="#ecfdf5" iconColor="#059669" value={`₹${(totalRevenue / 100000).toFixed(2)}L`} label="Revenue" />
        <KpiCard icon={Percent} iconBg="#faf5ff" iconColor="#9333ea" value={`${occupancy}%`} label="Occupancy" />
        <KpiCard icon={Ticket} iconBg="#fff7ed" iconColor="#d97706" value={String(tickets?.length ?? 0)} label="Ticket Types" />
      </div>

      <div className="card p-5">
        <h3 className="mb-3 text-[14px] font-semibold text-slate-900 dark:text-white">Ticket Types</h3>
        {isLoading && <div className="grid gap-3 sm:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</div>}
        {error && <ErrorState message={error.message} onRetry={() => mutate()} />}
        {tickets && tickets.length === 0 && <EmptyState title="No ticket types yet" description="Add General Admission, VIP, or Season Pass tiers." />}
        <div className="grid gap-3 sm:grid-cols-3">
          {tickets?.map((t) => (
            <div key={t.id} className="rounded-xl border border-slate-100 p-4 dark:border-white/10">
              <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">{t.type}</p>
              <p className="mt-1 text-[18px] font-bold text-slate-900 dark:text-white">₹{t.price.toLocaleString()}</p>
              <p className="text-[11.5px] text-slate-500 dark:text-slate-400">{t.sold} / {t.quantity} sold</p>
              <div className="mt-2 h-1.5 rounded-full bg-slate-100 dark:bg-white/10">
                <div className="h-1.5 rounded-full bg-brand-500" style={{ width: `${Math.min(100, (t.sold / t.quantity) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showCreate && <TicketModal onClose={() => setShowCreate(false)} onCreated={() => { mutate(); setShowCreate(false); toast.success("Ticket type added"); }} />}
      </AnimatePresence>
    </div>
  );
}

function TicketModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ type: "General", price: 499, quantity: 1000 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiRequest("/api/tickets", "POST", form);
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add ticket type.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#131a2e]" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white">Add Ticket Type</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option>General</option><option>VIP</option><option>Season Pass</option>
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input required type="number" placeholder="Price (₹)" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            <input required type="number" placeholder="Quantity" className="input" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
          </div>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-[12px] text-red-600 dark:bg-red-500/10">{error}</p>}
          <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-[13px] font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
            {loading && <Loader2 size={14} className="animate-spin" />} Add Ticket Type
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
