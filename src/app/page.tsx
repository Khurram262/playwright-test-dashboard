

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
import { ArrowRight, Download, Clipboard, FileText, Trash2, HelpCircle, Play, Bell, GitMerge, Monitor, EyeOff, Search, ChevronLeft, ChevronRight, Calendar, Hash, Activity, Layers, Clock, Filter } from "lucide-react";
import type { TestRun, Test, TestStatus, TestAttachment } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { cn, getTestRunSummary, getFlakyTests } from "@/lib/utils";
import { OverallSummary } from "@/components/overall-summary";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { LiveTestView } from "@/components/live-test-view";
import { AIInsights } from "@/components/ai-insights";

type ToastInfo = {
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
};


const getStatusBadgeClasses = (status: TestStatus) => {
  switch (status) {
    case 'passed':
      return 'border-green-500/60 bg-green-500/15 text-green-700 dark:border-green-400/50 dark:bg-green-400/10 dark:text-green-300 shadow-sm dark:shadow-green-500/10';
    case 'failed':
      return 'border-red-500/60 bg-red-500/15 text-red-700 dark:border-red-400/50 dark:bg-red-400/10 dark:text-red-300 shadow-sm dark:shadow-red-500/10';
    case 'skipped':
      return 'border-yellow-500/60 bg-yellow-500/15 text-yellow-700 dark:border-yellow-400/50 dark:bg-yellow-400/10 dark:text-yellow-300 shadow-sm dark:shadow-yellow-500/10';
    case 'interrupted':
      return 'border-gray-500/60 bg-gray-500/15 text-gray-700 dark:border-gray-400/50 dark:bg-gray-400/10 dark:text-gray-300 shadow-sm dark:shadow-gray-500/10';
    default:
      return '';
  }
};


const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';

export default function Home() {
  const [runs, setRuns] = React.useState<TestRun[]>([]);
  const [isRunning, setIsRunning] = React.useState(false);
  const [isClearAlertOpen, setIsClearAlertOpen] = React.useState(false);

  const { toast } = useToast();
  const [toastToShow, setToastToShow] = React.useState<ToastInfo | null>(null);
  const [canShowNotificationButton, setCanShowNotificationButton] = React.useState(false);
  const [showLiveTests, setShowLiveTests] = React.useState(true);

  const processJsonReport = React.useCallback((json: any, silent: boolean = false) => {
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
        if (!silent) {
          setToastToShow({
            variant: "destructive",
            title: "Empty Report",
            description: "The provided report does not contain any tests.",
          });
        }
        return;
      }

      const newRun: TestRun = {
        runId: `run-${new Date().toISOString()}`,
        executionDate: new Date().toISOString(),
        tests: tests
      };
      newRuns = [newRun];
    } else {
      if (!silent) {
        setToastToShow({
          variant: "destructive",
          title: "Invalid Format",
          description: "Please paste a valid Playwright JSON report or a previously exported runs file.",
        });
      }
      return;
    }

    setRuns(prevRuns => {
      const existingRunIds = new Set(prevRuns.map(r => r.runId));
      const filteredNewRuns = newRuns.filter(run => !existingRunIds.has(run.runId));

      if (filteredNewRuns.length === 0) {
        if (!silent) {
          setToastToShow({
            title: "No New Reports",
            description: "All imported reports were already present.",
          });
        }
        return prevRuns;
      }

      const updatedRuns = [...filteredNewRuns, ...prevRuns];
      localStorage.setItem('testRuns', JSON.stringify(updatedRuns));

      if (!silent) {
        setToastToShow({
          title: "Reports Imported",
          description: `Successfully imported ${filteredNewRuns.length} new test run(s).`,
        });
      }

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

  const fetchRuns = React.useCallback(async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/runs`);
      if (response.ok) {
        const data = await response.json();
        processJsonReport(data, true);
      }
    } catch (error) {
      console.error("Failed to fetch runs:", error);
    }
  }, [processJsonReport]);

  React.useEffect(() => {
    fetchRuns();
    const interval = setInterval(fetchRuns, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [fetchRuns]);

  const handleRunAll = async () => {
    setIsRunning(true);
    try {
      const response = await fetch(`${SERVER_URL}/api/run-all-tests`, { method: 'POST' });
      if (response.ok) {
        toast({
          title: "Test Run Started",
          description: "A full set of tests is now running.",
        });
      } else {
        const err = await response.json();
        toast({
          variant: "destructive",
          title: "Run Failed",
          description: err.error || "Could not start test run.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Could not connect to the test server.",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleStopRun = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/stop-run`, { method: 'POST' });
      if (response.ok) {
        toast({
          title: "Stopping Tests",
          description: "Request sent to stop the current test run.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not stop the test run.",
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 print:hidden">
        <div className="max-w-[1800px] mx-auto w-full h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* Left Section: Identity */}
          <div className="flex items-center gap-5">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 will-change-[opacity]" />
                <Logo className="relative h-8 w-8 text-primary drop-shadow-sm transition-transform duration-300 group-hover:scale-110" />
              </div>
              <div className="hidden md:flex flex-col">
                <span className="text-sm font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  Playwright Dashboard
                </span>
                <span className="text-[10px] text-muted-foreground font-mono leading-none tracking-wide">
                  TEST MONITOR
                </span>
              </div>
            </Link>

            <div className="h-8 w-px bg-border/40 hidden md:block rotate-12 mx-1" />

            {/* Quick Status / Breadcrumb */}
            <div className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/30 border border-border/40 text-xs font-medium text-muted-foreground">
                <span className="relative flex h-2 w-2">
                  <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", isRunning ? "bg-green-400" : "hidden")}></span>
                  <span className={cn("relative inline-flex rounded-full h-2 w-2", isRunning ? "bg-green-500" : "bg-zinc-400")}></span>
                </span>
                {isRunning ? "Running" : "Idle"}
              </div>
            </div>
          </div>


          {/* Right Section: Actions */}
          <div className="flex items-center gap-2 sm:gap-4">

            {/* Search Bar - Desktop */}
            <Button
              variant="outline"
              size="sm"
              className="hidden lg:flex items-center justify-between w-64 h-9 bg-muted/20 border-border/40 text-muted-foreground hover:bg-muted/40 hover:text-foreground hover:border-border/60 transition-all font-normal shadow-sm"
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
              <span className="flex items-center gap-2 text-xs">
                <Search className="h-3.5 w-3.5" />
                Find tests...
              </span>
              <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border bg-background/50 px-1.5 font-mono text-[10px] font-medium opacity-70 shadow-sm">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>

            {/* Mobile Search Icon */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-muted-foreground"
              onClick={() => {
                const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, metaKey: true, bubbles: true });
                document.dispatchEvent(event);
              }}
            >
              <Search className="h-5 w-5" />
            </Button>

            {canShowNotificationButton && (
              <Button variant="ghost" size="icon" onClick={requestNotificationPermission} className="text-muted-foreground hover:text-foreground relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              </Button>
            )}

            {runs.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLiveTests(!showLiveTests)}
                className={cn(
                  "hidden sm:flex h-9 px-3 transition-all",
                  showLiveTests ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {showLiveTests ? <EyeOff className="h-4 w-4 mr-2" /> : <Monitor className="h-4 w-4 mr-2" />}
                <span className="hidden xl:inline">{showLiveTests ? 'Hide Live View' : 'Show Live View'}</span>
              </Button>
            )}

            <div className="h-6 w-px bg-border/40 mx-2 hidden sm:block" />

            <ThemeSwitcher />

            <div className="hidden sm:flex items-center gap-2 pl-2">
              <Button
                onClick={handleRunAll}
                disabled={isRunning}
                className="h-9 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-[0_4px_14px_0_rgba(16,185,129,0.3)] border-0 transition-all active:scale-95 text-xs font-semibold px-4 rounded-full"
              >
                {isRunning ? <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> : <Play className="mr-2 h-3.5 w-3.5 fill-current" />}
                Run All
              </Button>

              {isRunning && (
                <Button
                  onClick={handleStopRun}
                  variant="destructive"
                  size="icon"
                  className="h-9 w-9 rounded-full shadow-md"
                  title="Stop Tests"
                >
                  <div className="h-3 w-3 rounded-sm bg-white" />
                </Button>
              )}

              <Button
                onClick={handleExport}
                disabled={runs.length === 0}
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full"
                title="Export JSON"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="p-4 sm:p-6 space-y-6">
        {sortedRuns.length === 0 ? (
          <div className="space-y-8">
            {/* Modern Empty State */}
            <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-muted/30 p-16 text-center shadow-lg">
              <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
              <div className="relative">
                <div className="mx-auto mb-6 w-fit rounded-full bg-gradient-to-br from-primary/20 to-primary/5 p-6 shadow-inner">
                  <FileText className="h-16 w-16 text-primary drop-shadow-lg animate-pulse" />
                </div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                  No test runs found
                </h3>
                <p className="mt-3 text-base text-muted-foreground max-w-md mx-auto">
                  Get started by running tests or automating with CI/CD integration
                </p>
                <div className="mt-8 flex items-center justify-center gap-4">
                  <Button
                    onClick={handleRunAll}
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Run All Tests
                  </Button>
                </div>
              </div>
            </div>

            {/* Modern CI/CD Card */}
            <Card className="overflow-hidden border-border/50 shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none"></div>
              <CardHeader className="relative flex flex-row items-center gap-4 border-b border-border/30 bg-gradient-to-r from-muted/50 to-transparent">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/30">
                  <GitMerge className="h-7 w-7 text-white" />
                  <div className="absolute inset-0 bg-white/20 rounded-xl animate-pulse"></div>
                </div>
                <div>
                  <CardTitle className="text-xl bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    Automate with CI/CD
                  </CardTitle>
                  <CardDescription className="text-muted-foreground/80">
                    Integrate seamlessly into your development workflow
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-5 pt-6 text-sm">
                <p className="text-muted-foreground leading-relaxed">
                  This dashboard automatically displays the latest test results from your CI/CD pipeline.
                  Configure your pipeline to output the Playwright JSON reporter.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                    <p className="font-semibold text-foreground">Example Command:</p>
                  </div>
                  <div className="relative rounded-lg border border-border/50 bg-muted/50 p-4 backdrop-blur-sm">
                    <pre className="text-xs overflow-x-auto">
                      <code className="text-foreground/90 font-mono">npx playwright test --reporter=json,line &gt; public/report.json</code>
                    </pre>
                    <div className="absolute top-2 right-2">
                      <div className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                        CLI
                      </div>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border border-green-200 dark:border-green-900/30 bg-green-50/50 dark:bg-green-950/20 p-4">
                  <p className="text-sm text-green-800 dark:text-green-300 flex items-start gap-2">
                    <span className="text-green-600 dark:text-green-400 text-lg">✓</span>
                    <span>Your CI pipeline will run tests, generate the report, and this dashboard will automatically pick it up on the next load.</span>
                  </p>
                </div>
              </CardContent>
            </Card>

          </div>
        ) : (
          <>
            {showLiveTests && <LiveTestView />}
            <OverallSummary runs={sortedRuns} flakyTestsCount={flakyTestNames.size} />

            {/* AI Insights Section */}
            {sortedRuns.length > 0 && <AIInsights runs={sortedRuns} />}

            {/* Premium Test Runs Section */}
            <Card className="border-border/40 bg-card/60 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="border-b border-border/30 bg-muted/5 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center ring-1 ring-primary/20 shadow-sm">
                      <Layers className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                        Test History
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Comprehensive log of {sortedRuns.length} execution{sortedRuns.length !== 1 ? 's' : ''}
                      </CardDescription>
                    </div>
                  </div>

                  {/* Optional: Filter Actions could go here */}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-background/50 text-xs font-mono">
                      Total: {runs.length}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/10 backdrop-blur-sm">
                      <TableRow className="border-b border-border/40 hover:bg-transparent">
                        <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground w-[180px]">
                          <div className="flex items-center gap-1.5">
                            <Hash className="h-3.5 w-3.5" />
                            Run ID
                          </div>
                        </TableHead>
                        <TableHead className="hidden md:table-cell font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            Executed
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground text-center">Total</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground text-center">Passed</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground text-center">Failed</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground text-center">Skipped</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground text-center">
                          <span className="hidden lg:inline">Interrupted</span>
                          <span className="lg:hidden">Int.</span>
                        </TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground text-center">Flaky</TableHead>
                        <TableHead className="text-right font-semibold text-xs uppercase tracking-wider text-muted-foreground pr-6">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedRuns.map((run) => {
                        const summary = getTestRunSummary(run);
                        const flakyInRun = run.tests.filter(t => flakyTestNames.has(t.name)).length;
                        return (
                          <TableRow
                            key={run.runId}
                            className="hover:bg-muted/30 transition-colors border-b border-border/30 group"
                          >
                            <TableCell className="font-mono text-xs font-medium text-foreground py-4">
                              <div className="flex items-center gap-2">
                                <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] text-muted-foreground">ID</span>
                                {run.runId.substring(0, 8)}...
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-xs text-muted-foreground py-4">
                              <div className="flex flex-col">
                                <span className="text-foreground font-medium">{new Date(run.executionDate).toLocaleDateString()}</span>
                                <span className="text-[10px] opacity-70">{new Date(run.executionDate).toLocaleTimeString()}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-semibold text-sm py-4">{summary.total}</TableCell>
                            <TableCell className="text-center py-4">
                              <div className={cn("inline-flex items-center justify-center min-w-[32px] h-6 rounded px-1.5 text-xs font-medium border transition-all",
                                summary.passed > 0
                                  ? "bg-green-500/10 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-800"
                                  : "bg-muted/30 text-muted-foreground border-transparent"
                              )}>
                                {summary.passed}
                              </div>
                            </TableCell>
                            <TableCell className="text-center py-4">
                              <div className={cn("inline-flex items-center justify-center min-w-[32px] h-6 rounded px-1.5 text-xs font-medium border transition-all",
                                summary.failed > 0
                                  ? "bg-red-500/10 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-800 shadow-sm"
                                  : "bg-muted/30 text-muted-foreground border-transparent"
                              )}>
                                {summary.failed}
                              </div>
                            </TableCell>
                            <TableCell className="text-center py-4">
                              <div className={cn("inline-flex items-center justify-center min-w-[32px] h-6 rounded px-1.5 text-xs font-medium border transition-all",
                                summary.skipped > 0
                                  ? "bg-yellow-500/10 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-800"
                                  : "bg-muted/30 text-muted-foreground border-transparent"
                              )}>
                                {summary.skipped}
                              </div>
                            </TableCell>
                            <TableCell className="text-center py-4">
                              <div className={cn("inline-flex items-center justify-center min-w-[32px] h-6 rounded px-1.5 text-xs font-medium border transition-all",
                                summary.interrupted > 0
                                  ? "bg-gray-500/10 text-gray-700 border-gray-200 dark:bg-gray-500/20 dark:text-gray-300 dark:border-gray-800"
                                  : "bg-muted/30 text-muted-foreground border-transparent"
                              )}>
                                {summary.interrupted}
                              </div>
                            </TableCell>
                            <TableCell className="text-center py-4">
                              <div className={cn("inline-flex items-center justify-center min-w-[32px] h-6 rounded px-1.5 text-xs font-medium border transition-all",
                                flakyInRun > 0
                                  ? "bg-orange-500/10 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-800"
                                  : "bg-muted/30 text-muted-foreground border-transparent"
                              )}>
                                {flakyInRun}
                              </div>
                            </TableCell>
                            <TableCell className="text-right py-4 pr-6">
                              <Button asChild variant="ghost" size="sm" className="h-8 w-24 text-xs font-medium group-hover:bg-primary/5 group-hover:text-primary transition-all border border-transparent group-hover:border-primary/20">
                                <Link href={`/run/${run.runId}`} className="flex items-center justify-between w-full">
                                  Details <ArrowRight className="h-3 w-3 opacity-50 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Modern Pagination Controls */}
                {totalPages >= 1 && (
                  <div className="flex items-center justify-between border-t border-border/40 bg-muted/10 px-6 py-4">
                    {/* Left side - Rows per page */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-muted-foreground">
                        Show
                      </span>
                      <Select
                        value={itemsPerPage.toString()}
                        onValueChange={(value) => {
                          setItemsPerPage(Number(value));
                          setCurrentPage(1);
                        }}
                      >
                        <SelectTrigger className="h-7 w-[65px] border-border/40 text-xs bg-background/50">
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
                      <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
                        rows
                      </span>
                    </div>

                    {/* Center - Page info */}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span>Page</span>
                      <span className="font-semibold text-foreground">{currentPage}</span>
                      <span>of</span>
                      <span className="font-semibold text-foreground">{totalPages}</span>
                    </div>

                    {/* Right side - Navigation buttons */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="h-7 w-7"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="h-7 w-7"
                      >
                        <ChevronRight className="h-4 w-4" />
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
