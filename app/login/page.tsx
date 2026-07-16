"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/fetcher";
import { useSession } from "@/hooks/useSession";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { mutate } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await apiRequest("/api/auth/login", "POST", { email, password });
      await mutate(user, { revalidate: false });
      toast.success(`Welcome back, ${user.name}!`);
      router.push(params.get("next") ?? "/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0B1330] via-[#141c42] to-[#1c2a5e] p-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl dark:bg-[#131a2e]"
      >
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-lg">⚽</div>
          <div>
            <p className="text-[15px] font-semibold text-slate-900 dark:text-white">SportFlow AI</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Sports Operations Platform</p>
          </div>
        </div>

        <h1 className="mb-1 text-[19px] font-semibold text-slate-900 dark:text-white">Welcome back</h1>
        <p className="mb-6 text-[13px] text-slate-500 dark:text-slate-400">Sign in to manage your clubs, teams, and matches.</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-[12px] font-medium text-slate-600 dark:text-slate-300">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@club.com" />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-slate-600 dark:text-slate-300">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="••••••••" />
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-[12.5px] text-red-600 dark:bg-red-500/10">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-[13.5px] font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            Sign In
          </button>
        </form>

        <p className="mt-5 text-center text-[12.5px] text-slate-500 dark:text-slate-400">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-brand-600 hover:underline">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
