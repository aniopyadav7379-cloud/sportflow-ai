import { Inbox, AlertTriangle, RefreshCw } from "lucide-react";

export function EmptyState({
  title = "Nothing here yet",
  description = "Once you add data, it'll show up here.",
  action,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-white/5">
        <Inbox size={20} />
      </div>
      <div>
        <p className="text-[13.5px] font-medium text-slate-700 dark:text-slate-200">{title}</p>
        <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-500/10">
        <AlertTriangle size={20} />
      </div>
      <div>
        <p className="text-[13.5px] font-medium text-slate-700 dark:text-slate-200">Something went wrong</p>
        <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">{message ?? "Please try again."}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[12.5px] font-medium text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
        >
          <RefreshCw size={13} /> Retry
        </button>
      )}
    </div>
  );
}
