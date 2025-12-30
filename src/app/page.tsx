'use client';

import Link from "next/link";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/screens/logo";
import { ArrowRight, Download, Clipboard, FileText, Trash2, HelpCircle } from "lucide-react";
import type { TestRun, Test, TestStatus } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { cn, getTestRunSummary, getFlakyTests } from "@/lib/utils";
import { OverallSummary } from "@/components/overall-summary";

const getStatusBadgeClasses = (status: TestStatus) => {
  switch (status) {
    case 'passed':
      return 'border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400';
    case 'failed':
      return 'border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400';
    case 'skipped':
      return 'border-yellow-500/50 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
    case 'interrupted':
        return 'border-gray-500/50 bg-gray-500/10 text-gray-700 dark:text-gray-400';
    default:
      return '';
  }
};


export default function Home() {
  const [runs, setRuns] = React.useState<TestRun[]>([]);
  const [isClearAlertOpen, setIsClearAlertOpen] = React.useState(false);
  const { toast } = useToast();

  const processJsonReport = React.useCallback((json: any) => {
    // New format check (array of runs with `startedAt` and `tests`)
    if (Array.isArray(json) && json.length > 0 && 'startedAt' in json[0] && 'tests' in json[0]) {
      const newRuns: TestRun[] = json.map((run: any) => ({
        runId: run.id?.toString() || `run-${run.startedAt}`,
        executionDate: run.startedAt,
        tests: run.tests.map((test: any): Test => ({
          id: `${test.file}-${test.line}-${run.id}`,
          name: test.title,
          description: `Location: ${test.file}:${test.line}`,
          duration: test.duration,
          status: test.status,
          error: test.error,
          errorLog: test.stack,
          attachments: test.attachments?.map((att: any) => ({
            type: 'screenshot',
            path: att.path,
            description: att.name,
          })) || [],
        })),
      }));

      setRuns(prevRuns => {
        const existingRunIds = new Set(prevRuns.map(r => r.runId));
        const filteredNewRuns = newRuns.filter(run => !existingRunIds.has(run.runId));

        if (filteredNewRuns.length === 0) {
          toast({
            title: "No New Reports",
            description: "All imported reports were already present.",
          });
          return prevRuns;
        }

        const updatedRuns = [...filteredNewRuns, ...prevRuns];
        localStorage.setItem('testRuns', JSON.stringify(updatedRuns));
        toast({
          title: "Reports Imported",
          description: `Successfully imported ${filteredNewRuns.length} new test run(s).`,
        });
        return updatedRuns;
      });
      return;
    }

    // Check if it's an array of our internal TestRun format
    if (Array.isArray(json) && json.length > 0 && 'runId' in json[0] && 'tests' in json[0]) {
       setRuns(prevRuns => {
        const existingRunIds = new Set(prevRuns.map(r => r.runId));
        const newRuns = json.filter((run: TestRun) => !existingRunIds.has(run.runId));
        
        if (newRuns.length === 0) {
           toast({
            title: "No New Reports",
            description: `All imported reports were already present.`,
          });
          return prevRuns;
        }

        const updatedRuns = [...newRuns, ...prevRuns];
        localStorage.setItem('testRuns', JSON.stringify(updatedRuns));
        toast({
          title: "Reports Imported",
          description: `Successfully imported ${newRuns.length} new test run(s).`,
        });
        return updatedRuns;
      });
      return;
    }

    // Original Playwright report format
    if (json.config && Array.isArray(json.suites)) {
        let tests: Test[] = [];
        function extractTestsFromSuites(suites: any[]): Test[] {
          let extractedTests: Test[] = [];
          if (!suites) return extractedTests;
          for (const suite of suites) {
            if (suite.specs) {
              for (const spec of suite.specs) {
                if (spec.tests) {
                  for (const test of spec.tests) {
                    const result = test.results?.[0];
                    extractedTests.push({
                      id: spec.id || `${spec.title}-${Date.now()}-${Math.random()}`,
                      name: spec.title || 'Unnamed Test',
                      description: `Location: ${spec.file || 'N/A'}:${spec.line || '0'}:${spec.column || '0'}`,
                      duration: result?.duration || 0,
                      status: test.status === 'timedOut' ? 'failed' : test.status,
                      error: result?.error?.message,
                      errorLog: result?.error?.stack,
                      attachments: [],
                    });
                  }
                }
              }
            }
            if (suite.suites) {
              extractedTests = extractedTests.concat(extractTestsFromSuites(suite.suites));
            }
          }
          return extractedTests;
        }
        tests = extractTestsFromSuites(json.suites);

        if (tests.length === 0) {
           toast({
              variant: "destructive",
              title: "Empty Report",
              description: "The provided report does not contain any tests.",
            });
            return;
        }
        
        const newRun: TestRun = {
          runId: `run-${new Date().toISOString()}`,
          executionDate: new Date().toISOString(),
          tests: tests
        };

        setRuns(prevRuns => {
          const updatedRuns = [newRun, ...prevRuns];
          localStorage.setItem('testRuns', JSON.stringify(updatedRuns));
          toast({
            title: "Report Loaded",
            description: `Successfully loaded ${newRun.tests.length} tests from the report.`,
          });
          return updatedRuns;
        });
        return;
      }

    toast({
      variant: "destructive",
      title: "Invalid Format",
      description: "Please paste a valid Playwright JSON report or a previously exported runs file.",
    });
  }, [toast]);

  React.useEffect(() => {
    // Load from localStorage on initial mount
    const savedRuns = localStorage.getItem('testRuns');
    if (savedRuns) {
      try {
        const parsedRuns = JSON.parse(savedRuns);
        if (Array.isArray(parsedRuns)) {
          setRuns(parsedRuns);
        }
      } catch (e) {
        console.error("Failed to parse test runs from localStorage", e);
        localStorage.removeItem('testRuns');
      }
    }

    // Auto-fetch latest report.json
    fetch('/report.json', { cache: "no-store" })
      .then(response => {
        if (!response.ok) {
            return null; // Don't throw for 404s etc.
        }
        // Check content-type to avoid parsing non-JSON responses
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return response.json();
        } else {
            return null;
        }
      })
      .then(data => {
         if (data) {
           processJsonReport(data);
         }
      })
      .catch(() => {
        // Silently fail if fetching fails, as this is an optional enhancement
        console.log("No new report.json found or failed to fetch.");
      });
  }, [processJsonReport]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const json = JSON.parse(text);
      processJsonReport(json);
    } catch (error) {
      console.error("Error pasting or parsing JSON:", error);
      toast({
        variant: "destructive",
        title: "Invalid Content",
        description: "Pasted content is not valid JSON or clipboard is empty. Please copy a valid report.",
      });
    }
  };

  const handleExport = () => {
    if (runs.length === 0) return;
    const jsonString = JSON.stringify(runs, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `test-runs-export-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Runs Exported",
      description: `Successfully exported ${runs.length} test runs.`,
    });
  };

  const handleClearAll = () => {
    localStorage.removeItem('testRuns');
    setRuns([]);
    setIsClearAlertOpen(false);
    toast({
      title: "Data Cleared",
      description: "All test run data has been cleared from your browser.",
    });
  };

  const sortedRuns = [...runs].sort((a, b) => new Date(b.executionDate).getTime() - new Date(a.executionDate).getTime());
  const flakyTestNames = getFlakyTests(runs);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-xl sm:px-6">
        <div className="flex items-center gap-3">
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold text-foreground">
            Playwright Report Dashboard
          </h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" onClick={handlePaste}>
            <Clipboard className="mr-2 h-4 w-4" />
            Paste Report
          </Button>
          <Button onClick={handleExport} disabled={runs.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export Runs
          </Button>
          <Button variant="destructive" onClick={() => setIsClearAlertOpen(true)} disabled={runs.length === 0}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Data
          </Button>
        </div>
      </header>
      <main className="p-4 sm:p-6 space-y-6">
        {sortedRuns.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card/50 p-12 text-center mt-8">
              <FileText className="mx-auto h-16 w-16 text-muted-foreground" />
              <h3 className="mt-6 text-2xl font-semibold text-foreground">No test runs found</h3>
              <p className="mt-2 text-base text-muted-foreground">
                Copy a Playwright JSON report and click the &quot;Paste Report&quot; button.
              </p>
              <div className="mt-6">
                <Button onClick={handlePaste}>
                  <Clipboard className="mr-2 h-4 w-4" />
                  Paste from Clipboard
                </Button>
              </div>
            </div>
          ) : (
            <>
              <OverallSummary runs={sortedRuns} flakyTestsCount={flakyTestNames.size} />
              <Card>
                <CardHeader>
                  <CardTitle>All Test Runs</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Run ID</TableHead>
                        <TableHead className="hidden md:table-cell">Execution Date</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Passed</TableHead>
                        <TableHead>Failed</TableHead>
                        <TableHead>Skipped</TableHead>
                        <TableHead>Interrupted</TableHead>
                        <TableHead>Flaky</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedRuns.map((run) => {
                        const summary = getTestRunSummary(run);
                        const flakyInRun = run.tests.filter(t => flakyTestNames.has(t.name)).length;
                        return (
                          <TableRow key={run.runId}>
                            <TableCell className="font-medium font-mono text-sm">{run.runId.substring(0, 15)}...</TableCell>
                            <TableCell className="hidden md:table-cell text-muted-foreground">
                              {new Date(run.executionDate).toLocaleString()}
                            </TableCell>
                            <TableCell>{summary.total}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={cn(getStatusBadgeClasses('passed'), summary.passed > 0 && 'font-semibold')}>
                                {summary.passed}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={cn(getStatusBadgeClasses('failed'), summary.failed > 0 && 'font-semibold')}>
                                {summary.failed}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={cn(getStatusBadgeClasses('skipped'), summary.skipped > 0 && 'font-semibold')}>
                                {summary.skipped}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={cn(getStatusBadgeClasses('interrupted'), summary.interrupted > 0 && 'font-semibold')}>
                                {summary.interrupted}
                              </Badge>
                            </TableCell>
                             <TableCell>
                              <Badge variant="outline" className={cn('border-orange-500/50 bg-orange-500/10 text-orange-700 dark:text-orange-400', flakyInRun > 0 && 'font-semibold')}>
                                {flakyInRun}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button asChild variant="ghost" size="sm">
                                <Link href={`/run/${run.runId}`}>
                                  View Report <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
      </main>
      <AlertDialog open={isClearAlertOpen} onOpenChange={setIsClearAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete all your
                imported test run data from your browser's local storage.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAll}>Continue</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
