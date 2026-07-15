"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import {
  LayoutDashboard,
  Building2,
  Users,
  Trophy,
  CalendarDays,
  Swords,
  Search,
  Landmark,
  Ticket,
  Handshake,
  BarChart3,
  Settings2,
  Bot,
  Settings,
  Crown,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clubs", label: "Clubs & Teams", icon: Building2 },
  { href: "/players", label: "Players", icon: Users },
  { href: "/leagues", label: "Leagues & Tournaments", icon: Trophy },
  { href: "/scheduling", label: "Scheduling", icon: CalendarDays },
  { href: "/matches", label: "Matches", icon: Swords },
  { href: "/scouting", label: "Scouting", icon: Search },
  { href: "/venues", label: "Venues", icon: Landmark },
  { href: "/ticketing", label: "Ticketing", icon: Ticket },
  { href: "/sponsorships", label: "Sponsorships", icon: Handshake },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/operations", label: "Operations", icon: Settings2 },
  { href: "/assistant", label: "AI Assistant", icon: Bot, badge: "NEW" },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { session } = useSession();

  return (
    <aside className="hidden w-[248px] shrink-0 flex-col justify-between border-r border-white/5 bg-[#0B0F1A] lg:flex">
      <div>
        <div className="flex items-center gap-2.5 px-6 py-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-lg">
            ⚽
          </div>
          <div className="leading-tight">
            <p className="text-[15px] font-semibold text-white">SportFlow AI</p>
            <p className="text-[11px] text-slate-400">Sports Operations Platform</p>
          </div>
        </div>

        <nav className="mt-1 flex flex-col gap-0.5 px-3">
          {NAV.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors ${
                  active
                    ? "bg-brand-600 text-white"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon size={17} strokeWidth={2} />
                  {item.label}
                </span>
                {item.badge && (
                  <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-400">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-3">
        <div className="rounded-xl bg-gradient-to-br from-brand-600/20 to-brand-700/10 p-4">
          <div className="mb-2 flex items-center gap-2 text-amber-400">
            <Crown size={16} />
            <p className="text-[13px] font-semibold text-white">Upgrade to Pro</p>
          </div>
          <p className="mb-3 text-[11.5px] leading-snug text-slate-400">
            Unlock advanced analytics, AI insights, and premium features.
          </p>
          <button className="w-full rounded-lg bg-brand-600 py-2 text-[12.5px] font-semibold text-white hover:bg-brand-700">
            Upgrade Now
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2.5 border-t border-white/5 px-1 pt-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600/30 text-[13px] font-semibold text-white">
            {session?.name?.[0] ?? "?"}
          </div>
          <div className="leading-tight">
            <p className="text-[13px] font-medium text-white">{session?.name ?? "Loading..."}</p>
            <p className="text-[11px] text-slate-400">{session?.role ?? ""}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
