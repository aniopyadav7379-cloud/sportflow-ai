"use client";

import { useState } from "react";
import useSWR from "swr";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Landmark, CalendarCheck2, Percent, Users2, Plus, MapPin, X, Loader2 } from "lucide-react";
import KpiCard from "@/components/ui/KpiCard";
import ProgressRing from "@/components/ui/ProgressRing";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { apiRequest, ApiError } from "@/lib/fetcher";

const FILTERS = ["All Venues", "Indoor", "Stadium", "Training Ground"];

type Venue = {
  id: string; name: string; location: string; type: string; capacity: number;
  surface: string; utilization: number; status: string;
  bookings: { id: string; title: string; start: string; end: string; status: string }[];
};

export default function VenuesPage() {
  const [filter, setFilter] = useState("All Venues");
  const [showCreate, setShowCreate] = useState(false);
  const { data: venues, error, isLoading, mutate } = useSWR<Venue[]>(
    `/api/venues${filter !== "All Venues" ? `?type=${encodeURIComponent(filter)}` : ""}`
  );

  const totalCapacity = venues?.reduce((s, v) => s + v.capacity, 0) ?? 0;
  const avgUtilization = venues?.length ? Math.round(venues.reduce((s, v) => s + v.utilization, 0) / venues.length) : 0;

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-brand-700">
          <Plus size={15} /> Add New Venue
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard icon={Landmark} iconBg="#fff7ed" iconColor="#d97706" value={String(venues?.length ?? 0)} label="Total Venues" />
        <KpiCard icon={CalendarCheck2} iconBg="#eef2ff" iconColor="#4f6bfd" value={String(venues?.reduce((s, v) => s + v.bookings.length, 0) ?? 0)} label="Upcoming Bookings" />
        <KpiCard icon={Percent} iconBg="#ecfdf5" iconColor="#059669" value={`${avgUtilization}%`} label="Average Utilization" />
        <KpiCard icon={Users2} iconBg="#faf5ff" iconColor="#9333ea" value={totalCapacity.toLocaleString()} label="Total Capacity" />
      </div>

      <div className="card p-4">
        <div className="mb-3 flex gap-2 overflow-x-auto">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-[12.5px] font-medium ${filter === f ? "bg-brand-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"}`}>
              {f}
            </button>
          ))}
        </div>

        {isLoading && <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>}
        {error && <ErrorState message={error.message} onRetry={() => mutate()} />}
        {venues && venues.length === 0 && <EmptyState title="No venues yet" description="Add your first venue to start booking it." />}

        <div className="space-y-3">
          {venues?.map((v) => (
            <div key={v.id} className="flex flex-col gap-3 rounded-xl border border-slate-100 p-3 dark:border-white/10 sm:flex-row sm:items-center">
              <div className="flex h-20 w-full items-center justify-center rounded-lg bg-gradient-to-br from-brand-500/20 to-brand-700/10 text-brand-500 sm:w-32">
                <MapPin size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[13.5px] font-semibold text-slate-800 dark:text-slate-100">{v.name}</p>
                  <span className="badge bg-brand-50 text-brand-600">{v.type}</span>
                </div>
                <p className="text-[11.5px] text-slate-500 dark:text-slate-400">📍 {v.location}</p>
                <div className="mt-1.5 flex gap-4 text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Capacity: {v.capacity.toLocaleString()}</span>
                  <span>Surface: {v.surface}</span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <ProgressRing value={v.utilization} size={64} stroke={6} color={v.utilization > 80 ? "#10b981" : "#f59e0b"} label={`${v.utilization}%`} sublabel="Util." />
                <span className={`badge ${v.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>● {v.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showCreate && (
          <VenueModal onClose={() => setShowCreate(false)} onCreated={() => { mutate(); setShowCreate(false); toast.success("Venue added"); }} />
        )}
      </AnimatePresence>
    </div>
  );
}

function VenueModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: "", location: "", type: "Stadium", capacity: 1000, surface: "Grass" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiRequest("/api/venues", "POST", form);
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create venue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#131a2e]" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white">Add New Venue</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input required placeholder="Venue name" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input required placeholder="Location" className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option>Stadium</option><option>Indoor</option><option>Training Ground</option>
            </select>
            <input required type="number" placeholder="Capacity" className="input" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
          </div>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-[12px] text-red-600 dark:bg-red-500/10">{error}</p>}
          <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-[13px] font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
            {loading && <Loader2 size={14} className="animate-spin" />} Create Venue
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
