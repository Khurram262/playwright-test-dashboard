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
    <header className="sticky top-0 z-20 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm" className="hidden sm:flex text-muted-foreground hover:text-foreground">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
            <span className="hidden sm:block w-px h-6 bg-border/50" />
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <FileJson className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-foreground">
                  Test Report
                </h1>
                <p className="text-xs font-mono text-muted-foreground/80">
                  {run.runId}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="hidden lg:flex items-center gap-2 text-muted-foreground hover:text-foreground w-64 justify-between px-3 h-9 bg-muted/20 border-border/50"
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
                <span className="text-xs">Search runs...</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 flex shadow-sm">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>
            </Button>

            <div className="flex items-center gap-2 pl-2">
              <Button variant="outline" size="sm" onClick={handleJsonExport} className="h-9 border-border/50 hover:bg-muted/50">
                <FileJson className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">JSON</span>
              </Button>
              <Button asChild variant="default" size="sm" className="h-9 shadow-md shadow-primary/20 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 border-0">
                <Link href={`/run/${run.runId}/pdf`} target="_blank">
                  <Printer className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Export PDF</span>
                  <span className="sm:hidden">PDF</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
