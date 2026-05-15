import type { ComponentType, ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn, formatCompact } from "../utils";

type Tone = "emerald" | "amber" | "rose" | "slate" | "sky";

type StatusBadgeProps = {
  label: string;
  tone: Tone;
};

type SectionCardProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

type StatCardProps = {
  label: string;
  value: number;
  helper: string;
  icon: ComponentType<{ className?: string }>;
};

type EmptyStateProps = {
  title: string;
  description: string;
};

type PaginationControlsProps = {
  page: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
};

const badgeTone = (tone: Tone) =>
  ({
    emerald: "bg-emerald-100 text-emerald-800 ring-emerald-200",
    amber: "bg-amber-100 text-amber-800 ring-amber-200",
    rose: "bg-rose-100 text-rose-700 ring-rose-200",
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
    sky: "bg-sky-100 text-sky-700 ring-sky-200",
  })[tone];

export function StatusBadge({ label, tone }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        badgeTone(tone)
      )}
    >
      {label}
    </span>
  );
}

export function SectionCard({
  title,
  subtitle,
  action,
  children,
  className,
}: SectionCardProps) {
  return (
    <section className={cn("rounded-xl border border-slate-200 bg-white", className)}>
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-3 py-2">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-700">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-[11px] text-slate-500">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      <div className="p-3">{children}</div>
    </section>
  );
}

export function StatCard({ label, value, helper, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
            {formatCompact(value)}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500 truncate">{helper}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-slate-600">
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
      <p className="text-base font-semibold text-slate-900">{title}</p>
      <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">{description}</p>
    </div>
  );
}

export function PaginationControls({
  page,
  totalPages,
  onPrevious,
  onNext,
}: PaginationControlsProps) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm text-slate-500">
      <span>
        Página {page} de {totalPages}
      </span>
      <div className="flex gap-2">
        <button
          onClick={onPrevious}
          disabled={page <= 1}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </button>
        <button
          onClick={onNext}
          disabled={page >= totalPages}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 disabled:opacity-40"
        >
          Próxima
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
