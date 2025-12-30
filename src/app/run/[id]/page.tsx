'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import type { TestRun } from '@/types';
import { ReportHeader } from '@/components/report-header';
import { ReportSummaryChart } from '@/components/report-summary-chart';
import { TestDetails } from '@/components/test-details';

export default function ReportPage() {
  const [run, setRun] = React.useState<TestRun | null>(null);
  const pathname = usePathname();

  React.useEffect(() => {
    if (pathname) {
      const runId = pathname.split('/')[2];
      const savedRuns = localStorage.getItem('testRuns');
      if (savedRuns) {
        const allRuns: TestRun[] = JSON.parse(savedRuns);
        const currentRun = allRuns.find(r => r.runId === runId);
        setRun(currentRun || null);
      }
    }
  }, [pathname]);

  if (!run) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-xl font-semibold text-foreground">
            Loading Report...
          </h1>
          <p className="text-muted-foreground">
            If the report does not load, it may not be available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ReportHeader run={run} />
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <ReportSummaryChart run={run} />
        <TestDetails run={run} />
      </main>
    </>
  );
}
