"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { TestRun } from "@/types";
import { ArrowLeft, FileJson, Printer, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ReportHeaderProps = {
  run: TestRun;
};

export function ReportHeader({ run }: ReportHeaderProps) {
  const { toast } = useToast();

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
    toast({
      title: "Run Exported",
      description: `Successfully exported run ${run.runId}.`,
    });
  };

  return (
    <header className="bg-card border-b sticky top-0 z-20 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                All Runs
              </Link>
            </Button>
            <span className="w-px h-6 bg-border" />
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                Test Report
              </h1>
              <p className="text-sm text-muted-foreground">
                Run ID: {run.runId}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="hidden lg:flex items-center gap-2 text-muted-foreground w-40 justify-between px-3"
              onClick={() => {
                const event = new KeyboardEvent('keydown', {
                  key: 'k',
                  ctrlKey: true,
                  metaKey: true,
                  bubbles: true
                });
                document.dispatchEvent(event);
              }}
            >
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <span>Search...</span>
              </div>
              <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
            <Button variant="outline" size="sm" onClick={handleJsonExport}>
              <FileJson className="mr-2 h-4 w-4" />
              Export JSON
            </Button>
            <Button asChild variant="default" size="sm">
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
