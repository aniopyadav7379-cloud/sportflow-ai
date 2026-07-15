"use client";

import { useState } from "react";
import useSWR from "swr";
import toast from "react-hot-toast";
import { Building2, Users, Trophy, Bell, Plug, Shield } from "lucide-react";
import { SkeletonTableRows } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/EmptyState";
import { apiRequest, ApiError } from "@/lib/fetcher";
import { useSession } from "@/hooks/useSession";

const SECTIONS = [
  { id: "organization", label: "Organization", icon: Building2 },
  { id: "users", label: "User Management", icon: Users },
  { id: "competition", label: "Competition Settings", icon: Trophy },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "security", label: "Security", icon: Shield },
];

const ROLES = ["ADMIN", "CLUB_MANAGER", "COACH", "SCOUT", "VIEWER"];

type UserRow = { id: string; name: string; email: string; role: string };

export default function SettingsPage() {
  const [active, setActive] = useState("organization");
  const { session } = useSession();
  const isAdmin = session?.role === "ADMIN";
  const { data: users, error, isLoading, mutate } = useSWR<UserRow[]>(isAdmin ? "/api/users" : null);

  async function changeRole(id: string, role: string) {
    try {
      await apiRequest(`/api/users/${id}`, "PATCH", { role });
      mutate();
      toast.success("Role updated");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update role");
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
      <div className="card p-3">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium ${
                active === s.id ? "bg-brand-50 text-brand-700 dark:bg-brand-600/10 dark:text-brand-300" : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5"
              }`}
            >
              <Icon size={16} /> {s.label}
            </button>
          );
        })}
      </div>

      <div className="card p-6">
        {active === "organization" && (
          <div className="space-y-4">
            <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white">Organization</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[12px] font-medium text-slate-600 dark:text-slate-300">Club Name</label>
                <input defaultValue="SportFlow AI" className="input" />
              </div>
              <div>
                <label className="mb-1 block text-[12px] font-medium text-slate-600 dark:text-slate-300">Contact Email</label>
                <input defaultValue={session?.email ?? ""} className="input" />
              </div>
            </div>
            <button onClick={() => toast.success("Saved (demo — wire to an Organization model to persist)")} className="rounded-lg bg-brand-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-700">
              Save Changes
            </button>
          </div>
        )}

        {active === "users" && (
          <div>
            <h3 className="mb-4 text-[15px] font-semibold text-slate-900 dark:text-white">User Management</h3>
            {!isAdmin && <p className="text-[13px] text-slate-500 dark:text-slate-400">Only Admins can manage users and roles.</p>}
            {isAdmin && isLoading && <SkeletonTableRows rows={4} cols={3} />}
            {isAdmin && error && <ErrorState message={error.message} onRetry={() => mutate()} />}
            {isAdmin && users && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[12.5px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400 dark:border-white/10">
                      <th className="pb-2 font-medium">Name</th><th className="pb-2 font-medium">Email</th><th className="pb-2 font-medium">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-slate-50 last:border-0 dark:border-white/5">
                        <td className="py-3 font-medium text-slate-800 dark:text-slate-100">{u.name}</td>
                        <td className="py-3 text-slate-600 dark:text-slate-300">{u.email}</td>
                        <td className="py-3">
                          <select value={u.role} onChange={(e) => changeRole(u.id, e.target.value)} className="input py-1">
                            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {!["organization", "users"].includes(active) && (
          <div className="flex h-64 items-center justify-center text-[13px] text-slate-400">
            {SECTIONS.find((s) => s.id === active)?.label} settings coming soon.
          </div>
        )}
      </div>
    </div>
  );
}
