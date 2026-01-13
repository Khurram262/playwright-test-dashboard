'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import type { TestRun } from '@/types';
import { ReportHeader } from '@/components/report-header';
import { ReportSummaryChart } from '@/components/report-summary-chart';
import { TestDetails } from '@/components/test-details';
import { Skeleton } from '@/components/ui/skeleton';
import { getFlakyTests } from '@/lib/utils';

export default function ReportPage() {
  const [run, setRun] = React.useState<TestRun | null>(null);
  const [flakyTestNames, setFlakyTestNames] = React.useState<Set<string>>(new Set());
  const [loading, setLoading] = React.useState(true);
  const pathname = usePathname();

  React.useEffect(() => {
    if (pathname) {
      const runId = pathname.split('/')[2];
      try {
        const savedRuns = localStorage.getItem('testRuns');
        if (savedRuns) {
          const allRuns: TestRun[] = JSON.parse(savedRuns);
          const currentRun = allRuns.find(r => r.runId === runId);
          setRun(currentRun || null);
          setFlakyTestNames(getFlakyTests(allRuns));
        }
      } catch (e) {
        console.error("Failed to load or parse test runs:", e);
        setRun(null);
      } finally {
        setLoading(false);
      }
    }
  }, [pathname]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!run) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-destructive">
            Report Not Found
          </h1>
          <p className="text-muted-foreground mt-2">
            The test run you are looking for could not be found. It might have been deleted or the ID is incorrect.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background/50">
      <ReportHeader run={run} />
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <ReportSummaryChart run={run} />
        <TestDetails run={run} flakyTestNames={flakyTestNames} />
      </main>
    </div>
  );
}
