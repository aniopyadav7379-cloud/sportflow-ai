import type { LucideIcon } from "lucide-react";
import { ArrowUp, ArrowDown } from "lucide-react";

export default function KpiCard({
  icon: Icon,
  iconBg,
  iconColor,
  value,
  label,
  change,
  changeLabel = "vs last month",
}: {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  value: string;
  label: string;
  change?: number;
  changeLabel?: string;
}) {
  const positive = (change ?? 0) >= 0;
  return (
    <div className="card flex items-center gap-3.5 p-4">
      <div className="kpi-icon" style={{ backgroundColor: iconBg, color: iconColor }}>
        <Icon size={20} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-xl font-semibold text-slate-900">{value}</p>
          {change !== undefined && (
            <span
              className={`flex items-center gap-0.5 text-[11px] font-semibold ${
                positive ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {positive ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
              {Math.abs(change)}%
            </span>
          )}
        </div>
        <p className="truncate text-[12.5px] text-slate-500">{label}</p>
        {change !== undefined && (
          <p className="text-[10.5px] text-slate-400">{changeLabel}</p>
        )}
      </div>
    </div>
  );
}
