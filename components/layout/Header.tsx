"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Bell, Mail, ChevronDown, Search, Menu, Sun, Moon, LogOut } from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { apiRequest } from "@/lib/fetcher";

const TITLES: Record<string, { title: string; subtitle?: string }> = {
  "/dashboard": { title: "Dashboard" },
  "/clubs": { title: "Clubs & Teams", subtitle: "Manage your clubs, teams, and their performance" },
  "/players": { title: "Players", subtitle: "Manage player profiles and performance" },
  "/leagues": { title: "Leagues & Tournaments" },
  "/scheduling": { title: "Scheduling", subtitle: "Manage fixtures, training sessions, facilities, and team availability" },
  "/matches": { title: "Matches", subtitle: "View, manage, and analyze all your matches" },
  "/venues": { title: "Venues", subtitle: "Manage your venues, facilities, and their availability" },
  "/scouting": { title: "Scouting", subtitle: "Discover, evaluate and recruit the best talent" },
  "/ticketing": { title: "Ticketing", subtitle: "Manage ticket sales, seating, and refunds" },
  "/sponsorships": { title: "Sponsorships", subtitle: "Manage sponsors and partnerships" },
  "/analytics": { title: "Analytics", subtitle: "Business intelligence dashboard" },
  "/operations": { title: "Operations", subtitle: "Daily operational management" },
  "/assistant": { title: "AI Assistant", subtitle: "Sports operations copilot" },
  "/settings": { title: "Settings", subtitle: "Configure the platform" },
};

function matchTitle(pathname: string) {
  const exact = TITLES[pathname];
  if (exact) return exact;
  const base = "/" + pathname.split("/")[1];
  return TITLES[base] ?? { title: "SportFlow AI" };
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { title, subtitle } = matchTitle(pathname);
  const { theme, setTheme } = useTheme();
  const { session, mutate } = useSession();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  async function handleLogout() {
    await apiRequest("/api/auth/logout", "POST");
    await mutate(undefined, { revalidate: false });
    toast.success("Signed out");
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-200/70 bg-white/90 px-4 py-4 backdrop-blur dark:border-white/5 dark:bg-[#0b0f1a]/90 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 min-w-0">
        <button className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5 lg:hidden">
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-[19px] font-semibold text-slate-900 dark:text-white">{title}</h1>
          {subtitle && <p className="truncate text-[12.5px] text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search players, teams, matches..."
            className="w-72 rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-[13px] text-slate-700 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
          />
        </div>

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
          aria-label="Toggle theme"
        >
          {mounted && theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5">
          <Bell size={19} />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-semibold text-white">
            5
          </span>
        </button>
        <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5">
          <Mail size={19} />
        </button>

        <div className="relative border-l border-slate-200 pl-3 dark:border-white/10">
          <button onClick={() => setMenuOpen((v) => !v)} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-[13px] font-semibold text-brand-700 dark:bg-brand-600/20 dark:text-brand-300">
              {session?.name?.[0] ?? "?"}
            </div>
            <div className="hidden leading-tight sm:block">
              <p className="text-[13px] font-medium text-slate-800 dark:text-slate-100">{session?.name ?? "Loading..."}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{session?.role ?? ""}</p>
            </div>
            <ChevronDown size={15} className="text-slate-400" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-11 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-white/10 dark:bg-[#131a2e]">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-3 py-2 text-[12.5px] text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5"
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
