

'use client';

import Link from "next/link";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Logo } from "@/components/screens/logo";
import { ArrowRight, Download, Clipboard, FileText, Trash2, HelpCircle, Play, Bell, GitMerge } from "lucide-react";
import type { TestRun, Test, TestStatus, TestAttachment } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { cn, getTestRunSummary, getFlakyTests } from "@/lib/utils";
import { OverallSummary } from "@/components/overall-summary";
import { ThemeSwitcher } from "@/components/theme-switcher";

type ToastInfo = {
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
};


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
  const [toastToShow, setToastToShow] = React.useState<ToastInfo | null>(null);
  const [canShowNotificationButton, setCanShowNotificationButton] = React.useState(false);


  const processJsonReport = React.useCallback((json: any) => {
    const processAttachments = (attachments: any[]): TestAttachment[] => {
      if (!attachments) return [];
      return attachments.map((att: any) => {
        const isLocalPath = !att.path.startsWith('http') && !att.path.startsWith('data:');
        return {
          type: att.contentType?.includes('video') ? 'video' : 'screenshot',
          path: isLocalPath ? 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' : att.path,
          description: att.name || 'Attachment',
        };
      });
    };

    let newRuns: TestRun[] = [];

    // New format check (array of runs with `startedAt` and `tests`)
    if (Array.isArray(json) && json.length > 0 && 'startedAt' in json[0] && 'tests' in json[0]) {
      newRuns = json.map((run: any) => ({
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
          attachments: processAttachments(test.attachments),
        })),
      }));
    }
    // Check if it's an array of our internal TestRun format
    else if (Array.isArray(json) && json.length > 0 && 'runId' in json[0] && 'tests' in json[0]) {
      newRuns = json;
    }
    // Original Playwright report format
    else if (json.config && Array.isArray(json.suites)) {
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
                    attachments: processAttachments(result?.attachments),
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
        setToastToShow({
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
      newRuns = [newRun];
    } else {
      setToastToShow({
        variant: "destructive",
        title: "Invalid Format",
        description: "Please paste a valid Playwright JSON report or a previously exported runs file.",
      });
      return;
    }

    setRuns(prevRuns => {
      const existingRunIds = new Set(prevRuns.map(r => r.runId));
      const filteredNewRuns = newRuns.filter(run => !existingRunIds.has(run.runId));

      if (filteredNewRuns.length === 0) {
        setToastToShow({
          title: "No New Reports",
          description: "All imported reports were already present.",
        });
        return prevRuns;
      }

      const updatedRuns = [...filteredNewRuns, ...prevRuns];
      localStorage.setItem('testRuns', JSON.stringify(updatedRuns));
      setToastToShow({
        title: "Reports Imported",
        description: `Successfully imported ${filteredNewRuns.length} new test run(s).`,
      });

      // Check for failures and send notification
      if (typeof window !== 'undefined' && 'Notification' in window) {
        const hasFailures = filteredNewRuns.some(run => getTestRunSummary(run).failed > 0);
        if (hasFailures) {
          sendFailureNotification(filteredNewRuns);
        }
      }

      return updatedRuns;
    });

  }, []);

  const sendFailureNotification = (newRuns: TestRun[]) => {
    if (Notification.permission !== 'granted') return;

    const runsWithFailures = newRuns.filter(run => getTestRunSummary(run).failed > 0);
    if (runsWithFailures.length === 0) return;

    const failedCount = runsWithFailures.reduce((acc, run) => acc + getTestRunSummary(run).failed, 0);
    const totalNewRuns = newRuns.length;

    const title = `${failedCount} New Test Failure(s)`;
    const body = `Found in ${runsWithFailures.length} of the ${totalNewRuns} newly imported run(s). Click to view reports.`;

    new Notification(title, { body, icon: '/logo.svg' });
  }

  const requestNotificationPermission = () => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          toast({
            title: "Notifications Enabled",
            description: "You'll be alerted about new test failures.",
          });
          setCanShowNotificationButton(false);
        }
      });
    }
  }


  React.useEffect(() => {
    if (toastToShow) {
      toast(toastToShow);
      setToastToShow(null);
    }
  }, [toastToShow, toast]);

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
    // Check if we should show the notification button
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted') {
      setCanShowNotificationButton(true);
    }
  }, []);

  React.useEffect(() => {
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

  // Pagination Logic
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);

  const totalPages = Math.ceil(sortedRuns.length / itemsPerPage);
  const paginatedRuns = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedRuns.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedRuns, currentPage]);

  // Reset to page 1 if data changes significantly
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

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
          {canShowNotificationButton && (
            <Button variant="outline" size="sm" onClick={requestNotificationPermission}>
              <Bell className="mr-2 h-4 w-4" />
              Enable Notifications
            </Button>
          )}
          <ThemeSwitcher />
          <div className="hidden sm:flex items-center gap-2">


            <Button onClick={handleExport} disabled={runs.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Export Runs
            </Button>
            <Button variant="destructive" onClick={() => setIsClearAlertOpen(true)} disabled={runs.length === 0}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Data
            </Button>
          </div>
        </div>
      </header>
      <main className="p-4 sm:p-6 space-y-6">
        {sortedRuns.length === 0 ? (
          <div className="space-y-8">
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card/50 p-12 text-center">
              <FileText className="mx-auto h-16 w-16 text-muted-foreground" />
              <h3 className="mt-6 text-2xl font-semibold text-foreground">No test runs found</h3>
              <p className="mt-2 text-base text-muted-foreground">
                Get started by manually importing a report or automating it with CI/CD.
              </p>
              <div className="mt-6 flex items-center gap-4">


              </div>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <GitMerge className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Automate with CI/CD</CardTitle>
                  <CardDescription>Integrate the dashboard into your development workflow.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>
                  This dashboard is designed to automatically display the latest test results from your CI/CD pipeline.
                  Configure your pipeline to output the Playwright JSON reporter to the `public/report.json` file.
                </p>
                <div className="space-y-2">
                  <p className="font-medium text-foreground">Example Command:</p>
                  <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
                    <code>npx playwright test --reporter=json,line &gt; public/report.json</code>
                  </pre>
                </div>
                <p>
                  Your CI pipeline will run the tests, generate the report, and this dashboard will automatically pick it up on the next page load.
                </p>
              </CardContent>
            </Card>

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
                    {paginatedRuns.map((run) => {
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

                {/* Pagination Controls */}
                {totalPages >= 1 && (
                  <div className="flex items-center justify-end space-x-4 p-4 border-t">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-muted-foreground">Rows per page</p>
                      <Select
                        value={itemsPerPage.toString()}
                        onValueChange={(value) => {
                          setItemsPerPage(Number(value));
                          setCurrentPage(1);
                        }}
                      >
                        <SelectTrigger className="h-8 w-[70px]">
                          <SelectValue placeholder={itemsPerPage.toString()} />
                        </SelectTrigger>
                        <SelectContent side="top">
                          {[10, 25, 50, 100].map((pageSize) => (
                            <SelectItem key={pageSize} value={pageSize.toString()}>
                              {pageSize}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <div className="text-sm font-medium text-muted-foreground">
                        Page {currentPage} of {totalPages}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}

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
