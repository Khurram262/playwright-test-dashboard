'use client';

import { notFound, useRouter } from "next/navigation";
import { ReportHeader } from "@/components/screens/report-header";
import { ReportSummaryChart } from "@/components/screens/report-summary-chart";
import { TestDetails } from "@/components/screens/test-details";
import React from "react";
import type { TestRun } from "@/types";
import { Button } from "@/components/ui/button";

type ReportPageProps = {
  params: {
    runId: string;
  };
};

export default function ReportPage({ params }: ReportPageProps) {
  const [run, setRun] = React.useState<TestRun | undefined>(undefined);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    const savedRuns = localStorage.getItem('testRuns');
    if (savedRuns) {
      try {
        const runs: TestRun[] = JSON.parse(savedRuns);
        const currentRun = runs.find((r) => r.runId === params.runId);
        if (currentRun) {
          setRun(currentRun);
        }
      } catch(e) {
        console.error("Failed to parse test runs from local storage", e);
      }
    }
    setLoading(false);
  }, [params.runId]);

  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!run) {
    // We can't use notFound() directly in useEffect, so we trigger a navigation
    // A better approach for future would be to have a dedicated 404 component
    // that we can render here.
    return (
        <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
            <main className="max-w-7xl mx-auto text-center py-20">
                <h1 className="text-4xl font-bold mb-4">Run Not Found</h1>
                <p className="text-muted-foreground mb-8">The test run with ID "{params.runId}" could not be found in your local storage.</p>
                <Button onClick={() => router.push('/')}>Back to All Runs</Button>
            </main>
        </div>
    );
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
