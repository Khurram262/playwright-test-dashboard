"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import type { TestRun } from "@/types";
import { ArrowLeft, FileJson2, Printer } from "lucide-react";

type ReportHeaderProps = {
  run: TestRun;
};

export function ReportHeader({ run }: ReportHeaderProps) {
  const handleJsonExport = () => {
    const jsonString = JSON.stringify(run, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${run.runId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <header className="bg-card border-b sticky top-0 z-10 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-primary hover:underline">
              <ArrowLeft className="h-4 w-4"/>
              All Runs
            </Link>
            <span className="w-px h-6 bg-border" />
            <div>
              <h1 className="text-lg font-semibold font-headline text-foreground">
                Report: {run.runId}
              </h1>
              <p className="text-sm text-muted-foreground">
                {new Date(run.executionDate).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleJsonExport}>
              <FileJson2 className="mr-2 h-4 w-4" />
              Export JSON
            </Button>
            <Button asChild>
              <Link href={`/run/${run.runId}/pdf`} target="_blank">
                <Printer className="mr-2 h-4 w-4" />
                Export PDF
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
