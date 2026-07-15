"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Sparkles, Send, CalendarDays, MapPinned, ActivitySquare, Search, BarChart3, Loader2 } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/fetcher";

const CAPABILITIES = [
  { icon: CalendarDays, label: "Schedule matches" },
  { icon: MapPinned, label: "Find available venues" },
  { icon: ActivitySquare, label: "Predict player injuries" },
  { icon: Search, label: "Recommend scouts" },
  { icon: BarChart3, label: "Analyze performance" },
];

type Message = { role: "user" | "assistant"; content: string };

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm your Sports Operations Copilot, running on Groq. Ask me to schedule a match, find a venue, or analyze performance — I'll ground my answers in your live platform data." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const { reply } = await apiRequest<{ reply: string }>("/api/assistant", "POST", {
        messages: nextMessages.slice(-10),
      });
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong reaching the assistant.";
      setMessages((m) => [...m, { role: "assistant", content: message }]);
      toast.error("Assistant request failed");
    } finally {
      setLoading(false);
      requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }));
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <div className="card flex h-[600px] flex-col p-5">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles size={16} className="text-brand-500" />
          <h3 className="text-[14.5px] font-semibold text-slate-900 dark:text-white">AI Assistant</h3>
          <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[9.5px] font-bold text-brand-600 dark:bg-brand-600/20 dark:text-brand-300">
            Groq · Llama 3.3
          </span>
        </div>
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto pr-1">
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[13px] ${
                  m.role === "user" ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-200"
                }`}
              >
                {m.content}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2.5 text-[13px] text-slate-500 dark:bg-white/5 dark:text-slate-400">
                <Loader2 size={13} className="animate-spin" /> Thinking...
              </div>
            </div>
          )}
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 dark:border-white/10">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Ask me anything..."
            disabled={loading}
            className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-slate-400 disabled:opacity-60"
          />
          <button onClick={send} disabled={loading} className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-600 text-white disabled:opacity-60">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
      </div>

      <div className="card p-5">
        <h4 className="mb-3 text-[13.5px] font-semibold text-slate-900 dark:text-white">Capabilities</h4>
        <div className="space-y-2.5">
          {CAPABILITIES.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.label} className="flex items-center gap-2.5 rounded-lg border border-slate-100 p-2.5 text-[12.5px] text-slate-700 dark:border-white/10 dark:text-slate-200">
                <Icon size={15} className="text-brand-500" /> {c.label}
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-[11px] leading-relaxed text-slate-400">
          Responses are grounded with a live snapshot of your clubs, players, matches, and venue utilization pulled straight from the database.
        </p>
      </div>
    </div>
  );
}
