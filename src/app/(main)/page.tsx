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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/screens/logo";
import { ArrowRight, Download, Clipboard } from "lucide-react";
import type { TestRun, Test } from '@/types';
import { useToast } from "@/hooks/use-toast";

// Utility function to get summary, moved from utils as it's only used here
const getTestRunSummary = (run: TestRun) => {
  const summary = {
    passed: 0,
    failed: 0,
    skipped: 0,
    total: run.tests.length,
  };
  for (const test of run.tests) {
    if (test.status === "passed") summary.passed++;
    else if (test.status === "failed") summary.failed++;
    else if (test.status === "skipped") summary.skipped++;
  }
  return summary;
};

export default function Home() {
  const [runs, setRuns] = React.useState<TestRun[]>([]);
  const { toast } = useToast();

  const processJsonReport = (json: any) => {
    // Check for previously exported runs from this app (an array of TestRun objects)
    if (Array.isArray(json) && json.length > 0 && json.every(item => 'runId' in item && 'tests' in item)) {
      setRuns(prevRuns => {
        const existingRunIds = new Set(prevRuns.map(run => run.runId));
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

    // Check for standard Playwright report format with less strictness
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
                  // A single spec can have multiple tests (e.g. retries)
                  const result = test.results?.[0]; // Get the first result
                  extractedTests.push({
                    id: spec.id || `${spec.title}-${Date.now()}-${Math.random()}`,
                    name: spec.title || 'Unnamed Test',
                    description: `Location: ${spec.file || 'N/A'}:${spec.line || '0'}:${spec.column || '0'}`,
                    duration: result?.duration || 0,
                    status: test.status === 'timedOut' ? 'failed' : test.status,
                    error: result?.error?.message,
                    errorLog: result?.error?.stack,
                    attachments: [], // Attachments are not in the json report by default
                  });
                }
              }
            }
          }
          // Recursively process nested suites
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
        // Prevent adding duplicate run if it was just auto-loaded
        if (prevRuns.some(r => r.runId === newRun.runId)) return prevRuns;
        const updatedRuns = [newRun, ...prevRuns];
        localStorage.setItem('testRuns', JSON.stringify(updatedRuns));
        return updatedRuns;
      });
      toast({
        title: "Report Loaded",
        description: `Successfully loaded ${newRun.tests.length} tests from the report.`,
      });
      return;
    }
    
    toast({
      variant: "destructive",
      title: "Invalid Format",
      description: "Please paste a valid Playwright JSON report or a previously exported runs file.",
    });
  }
  
  React.useEffect(() => {
    // Load runs from localStorage on initial render
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

    // Check if there is a report.json from a recent test run
    fetch('/report.json', { cache: "no-store" })
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        return null;
      })
      .then(data => {
         if (data) {
           processJsonReport(data);
         }
      })
      .catch(() => {
        console.log("No new report.json found in /public.");
      });

  }, []);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        toast({
          variant: "destructive",
          title: "Clipboard Empty",
          description: "Your clipboard is empty. Please copy the report JSON first.",
        });
        return;
      }
      const json = JSON.parse(text);
      processJsonReport(json);
    } catch (error) {
      console.error("Error pasting or parsing JSON:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "Paste Error",
        description: `Could not process clipboard content. Make sure it's valid JSON. Error: ${errorMessage}`,
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


  const sortedRuns = [...runs].sort((a, b) => new Date(b.executionDate).getTime() - new Date(a.executionDate).getTime());

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <main className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Logo className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-2xl font-bold font-headline text-foreground">
                Playwright Report Exporter
              </h1>
              <p className="text-muted-foreground">
                Dashboard for test execution results.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePaste}>
              <Clipboard className="mr-2 h-4 w-4" />
              Paste Report
            </Button>
            <Button onClick={handleExport} disabled={runs.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Export Runs
            </Button>
          </div>
        </header>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Test Runs</CardTitle>
          </CardHeader>
          <CardContent>
             {sortedRuns.length === 0 ? (
              <div 
                className="text-center py-12 border-2 border-dashed rounded-lg"
              >
                <Clipboard className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium text-foreground">No test runs found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Click the &quot;Paste Report&quot; button to get started.
                </p>
              </div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Run ID</TableHead>
                  <TableHead className="hidden md:table-cell">Execution Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Passed</TableHead>
                  <TableHead>Failed</TableHead>
                  <TableHead>Skipped</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRuns.map((run) => {
                  const summary = getTestRunSummary(run);
                  return (
                    <TableRow key={run.runId}>
                      <TableCell className="font-medium">{run.runId.substring(0, 12)}...</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {new Date(run.executionDate).toLocaleString()}
                      </TableCell>
                      <TableCell>{summary.total}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {summary.passed}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          {summary.failed}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          {summary.skipped}
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
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
