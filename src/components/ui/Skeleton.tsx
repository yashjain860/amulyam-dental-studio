import React from "react";

export function Skeleton({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 ${className}`}
      {...props}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24 rounded-lg" />
        <Skeleton className="h-9 w-9 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-16 rounded-xl" />
      <Skeleton className="h-3 w-32 rounded-lg" />
    </div>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Skeleton */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 rounded-3xl flex flex-col sm:flex-row justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48 rounded-lg" />
            <Skeleton className="h-3.5 w-64 rounded-lg" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      {/* Patient Context Strip Skeleton */}
      <div className="bg-white dark:bg-slate-900 border border-amber-500/30 p-4 rounded-2xl flex flex-col sm:flex-row justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-40 rounded-lg" />
            <Skeleton className="h-3 w-60 rounded-lg" />
          </div>
        </div>
        <Skeleton className="h-8 w-44 rounded-xl" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Tabs Skeleton */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-10 w-32 rounded-xl flex-shrink-0" />
        ))}
      </div>

      {/* Main Content Area Skeleton (Kanban or Table) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {[1, 2, 3, 4, 5].map((col) => (
          <div
            key={col}
            className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 space-y-3"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-5 w-6 rounded-full" />
            </div>
            <div className="space-y-2.5">
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between gap-4">
        <Skeleton className="h-9 w-72 rounded-xl" />
        <Skeleton className="h-9 w-36 rounded-xl" />
      </div>
      <div className="p-4 space-y-3">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center justify-between gap-4 py-2 border-b border-slate-100 dark:border-slate-800/60 last:border-0">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className={`h-4 ${c === 0 ? "w-40" : "w-24"} rounded`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function PatientPortalSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <Skeleton className="w-14 h-14 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-44 rounded-lg" />
            <Skeleton className="h-3.5 w-60 rounded-lg" />
          </div>
        </div>
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>

      {/* Appointment Cards */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-48 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export function BookingWizardSkeleton() {
  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-10 rounded-3xl shadow-xl space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
        <Skeleton className="h-6 w-48 rounded-lg" />
        <Skeleton className="h-4 w-20 rounded" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <div className="flex justify-between pt-4">
        <Skeleton className="h-10 w-24 rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
    </div>
  );
}
