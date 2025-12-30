'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import type { TestRun } from '@/types';
import { Logo } from '@/components/screens/logo';
import { ReportSummaryChart } from '@/components/report-summary-chart';
import { TestDetails } from '@/components/test-details';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

export default function ReportPdfPage() {
  const [run, setRun] = React.useState<TestRun | null>(null);
  const pathname = usePathname();
  const runId = pathname.split('/')[2];

  React.useEffect(() => {
    const savedRuns = localStorage.getItem('testRuns');
    if (savedRuns) {
      const allRuns: TestRun[] = JSON.parse(savedRuns);
      const currentRun = allRuns.find(r => r.runId === runId);
      if (currentRun) {
        setRun(currentRun);
        // Automatically trigger print dialog after a short delay
        setTimeout(() => {
            window.print();
        }, 500);
      }
    }
  }, [runId]);

  if (!run) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-xl font-semibold">Run not found</h1>
          <p>This report could not be located in your local storage.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-black p-8 print-container">
      <div className="no-print fixed top-4 right-4">
        <Button onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print
        </Button>
      </div>
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Logo className="h-12 w-12 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Playwright Test Report</h1>
            <p className="text-gray-600">Generated on {new Date().toLocaleString()}</p>
          </div>
        </div>
        <div className="text-right">
            <p className="text-sm font-mono text-gray-500">Run ID: {run.runId}</p>
             <p className="text-sm text-gray-500">
                Executed: {new Date(run.executionDate).toLocaleString()}
              </p>
        </div>
      </header>

      <main className="space-y-8">
        <div className="print-break-inside-avoid">
            <ReportSummaryChart run={run} />
        </div>
        
        <div className="print-break-before">
            <TestDetails run={run} />
        </div>
      </main>
    </div>
  );
}
