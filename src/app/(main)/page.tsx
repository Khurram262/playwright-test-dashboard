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
import { getTestRunSummary } from "@/lib/utils";
import { Logo } from "@/components/screens/logo";
import { ArrowRight, Upload } from "lucide-react";
import type { TestRun } from '@/types';
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [runs, setRuns] = React.useState<TestRun[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const { toast } = useToast();

  const processJsonReport = (json: any) => {
    // Basic validation to check if it looks like a playwright report
    if (json.config && json.suites) {
      const newRun: TestRun = {
        runId: `run-${new Date().toISOString()}`,
        executionDate: new Date().toISOString(),
        tests: json.suites.flatMap((suite: any) => 
          suite.specs.flatMap((spec: any) => 
            spec.tests.map((test: any, index: number) => ({
              id: spec.id || `${spec.title}-${index}`,
              name: spec.title,
              description: `Location: ${spec.file}:${spec.line}:${spec.column}`,
              duration: test.results[0]?.duration || 0,
              status: test.status === 'timedOut' ? 'failed' : test.status,
              error: test.error?.message,
              errorLog: test.error?.stack,
              attachments: [], // Attachments are not in the json report by default
            }))
          )
        )
      };
      
      setRuns(prevRuns => {
        const updatedRuns = [newRun, ...prevRuns];
        localStorage.setItem('testRuns', JSON.stringify(updatedRuns));
        return updatedRuns;
      });
      toast({
        title: "Report Loaded",
        description: `Successfully loaded ${newRun.tests.length} tests.`,
      })

    } else if (Array.isArray(json) && json.every(item => 'runId' in item)) {
      // It looks like an array of TestRun objects, likely from a previous export
      setRuns(prevRuns => {
        const newRuns = [...json, ...prevRuns];
        // remove duplicates
        const uniqueRuns = Array.from(new Map(newRuns.map(run => [run.runId, run])).values());
        localStorage.setItem('testRuns', JSON.stringify(uniqueRuns));
        return uniqueRuns;
      });
       toast({
        title: "Reports Imported",
        description: `Successfully imported ${json.length} test runs.`,
      })
    }
    else {
      toast({
        variant: "destructive",
        title: "Invalid File Format",
        description: "Please upload a Playwright JSON report.",
      })
    }
  }
  
  React.useEffect(() => {
    // Load runs from localStorage on initial render
    const savedRuns = localStorage.getItem('testRuns');
    if (savedRuns) {
      setRuns(JSON.parse(savedRuns));
    }

    // Check if there is a report.json from a recent test run
    fetch('/report.json')
      .then(response => {
        if (response.ok) {
          // Invalidate cache to get fresh data
          const headers = new Headers();
          headers.append('pragma', 'no-cache');
          headers.append('cache-control', 'no-cache');
          return fetch('/report.json', { headers }).then(res => res.json());
        }
        throw new Error('No new report file found.');
      })
      .then(data => {
         processJsonReport(data);
         // Optionally clear the report so it's not re-processed on next load
      })
      .catch(() => {
        // This is expected if the file doesn't exist, so we do nothing.
      });

  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };
  
  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const json = JSON.parse(text);
        processJsonReport(json);
      } catch (error) {
        console.error("Error parsing JSON:", error);
        toast({
          variant: "destructive",
          title: "File Read Error",
          description: "Could not parse the uploaded JSON file.",
        });
      }
    };
    reader.readAsText(file);
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      processFile(event.dataTransfer.files[0]);
      event.dataTransfer.clearData();
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  
  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const sortedRuns = runs.sort((a, b) => new Date(b.executionDate).getTime() - new Date(a.executionDate).getTime());

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
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Report
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="application/json"
          />
        </header>

        <Card 
          className={`shadow-lg transition-all ${isDragging ? 'border-primary' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
        >
          <CardHeader>
            <CardTitle>Test Runs</CardTitle>
          </CardHeader>
          <CardContent>
             {sortedRuns.length === 0 ? (
              <div 
                className="text-center py-12 border-2 border-dashed rounded-lg cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium text-foreground">No test runs found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Run `npm run test:e2e` or drag and drop a report here.
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
