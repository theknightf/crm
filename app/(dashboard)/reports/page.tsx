'use client';

import dynamic from 'next/dynamic';

const ReportsContent = dynamic(
  () => import('@/components/reports/reports-content').then((m) => m.ReportsContent),
  {
    loading: () => (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground">Loading analytics...</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-secondary" />
          ))}
        </div>
      </div>
    ),
  },
);

export default function ReportsPage() {
  return <ReportsContent />;
}
