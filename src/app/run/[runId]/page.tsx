'use client';

import { notFound } from "next/navigation";
import { ReportHeader } from "@/components/report-header";
import { ReportSummaryChart } from "@/components/report-summary-chart";
import { TestDetails } from "@/components/test-details";
import React from "react";
import type { TestRun } from "@/types";

type ReportPageProps = {
  params: {
    runId: string;
  };
};

export default function ReportPage({ params }: ReportPageProps) {
  const [run, setRun] = React.useState<TestRun | undefined>(undefined);

  React.useEffect(() => {
    const savedRuns = localStorage.getItem('testRuns');
    if (savedRuns) {
      const runs: TestRun[] = JSON.parse(savedRuns);
      const currentRun = runs.find((r) => r.runId === params.runId);
      if (currentRun) {
        setRun(currentRun);
      } else {
        notFound();
      }
    } else {
      notFound();
    }
  }, [params.runId]);


  if (!run) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <ReportHeader run={run} />
      <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
        <div className="grid gap-8">
          <ReportSummaryChart run={run} />
          <TestDetails run={run} />
        </div>
      </main>
    </div>
  );
}
