import { notFound } from "next/navigation";
import { testRuns } from "@/lib/test-data";
import { ReportHeader } from "@/components/report-header";
import { ReportSummaryChart } from "@/components/report-summary-chart";
import { TestDetails } from "@/components/test-details";

type ReportPageProps = {
  params: {
    runId: string;
  };
};

export default function ReportPage({ params }: ReportPageProps) {
  const run = testRuns.find((r) => r.runId === params.runId);

  if (!run) {
    notFound();
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
