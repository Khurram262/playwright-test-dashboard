'use client';

import { notFound } from "next/navigation";
import Image from "next/image";
import { getTestRunSummary } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Clock, FileText, MinusCircle, XCircle } from "lucide-react";
import React from "react";
import type { TestRun } from "@/types";

type ReportPdfPageProps = {
  params: {
    runId: string;
  };
};

const StatusIcon = ({ status }: { status: 'passed' | 'failed' | 'skipped' }) => {
  if (status === 'passed') return <CheckCircle2 className="h-5 w-5 text-green-600" />;
  if (status === 'failed') return <XCircle className="h-5 w-5 text-red-600" />;
  if (status === 'skipped') return <MinusCircle className="h-5 w-5 text-yellow-600" />;
  return null;
};

export default function ReportPdfPage({ params }: ReportPdfPageProps) {
  const [run, setRun] = React.useState<TestRun | undefined>(undefined);

  React.useEffect(() => {
    const savedRuns = localStorage.getItem('testRuns');
    if (savedRuns) {
      const runs: TestRun[] = JSON.parse(savedRuns);
      const currentRun = runs.find((r) => r.runId === params.runId);
      if (currentRun) {
        setRun(currentRun);
      } else {
        notFound();
      }
    } else {
      notFound();
    }
  }, [params.runId]);
  
  React.useEffect(() => {
    if(run) {
      setTimeout(() => window.print(), 500);
    }
  }, [run]);

  if (!run) {
    return <div>Loading report for printing...</div>;
  }

  const summary = getTestRunSummary(run);

  return (
    <div className="bg-white text-black p-8 print-container">
      <header className="flex justify-between items-center mb-8 print-break-inside-avoid no-print">
        <div>
          <h1 className="text-3xl font-bold font-headline">Test Execution Report</h1>
          <p className="text-gray-600">Run ID: {run.runId}</p>
          <p className="text-gray-600">
            Executed on: {new Date(run.executionDate).toLocaleString()}
          </p>
        </div>
        <p className="text-sm text-gray-500">
          Your report is being prepared for printing. If the print dialog doesn't appear automatically, please use your browser's print functionality (Ctrl/Cmd + P) to save as PDF.
        </p>
      </header>
       <div className="hidden print:block mb-8">
        <h1 className="text-3xl font-bold font-headline">Test Execution Report</h1>
        <p className="text-gray-600">Run ID: {run.runId}</p>
        <p className="text-gray-600">
          Executed on: {new Date(run.executionDate).toLocaleString()}
        </p>
      </div>

      <section className="mb-8 print-break-inside-avoid">
        <h2 className="text-2xl font-semibold mb-4 font-headline">Summary</h2>
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader><CardTitle>Total Tests</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">{summary.total}</p></CardContent>
          </Card>
          <Card className="border-green-600 bg-green-50">
            <CardHeader><CardTitle>Passed</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold text-green-700">{summary.passed}</p></CardContent>
          </Card>
          <Card className="border-red-600 bg-red-50">
            <CardHeader><CardTitle>Failed</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold text-red-700">{summary.failed}</p></CardContent>
          </Card>
           <Card className="border-yellow-600 bg-yellow-50">
            <CardHeader><CardTitle>Skipped</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold text-yellow-700">{summary.skipped}</p></CardContent>
          </Card>
        </div>
      </section>

      <Separator className="my-8" />
      
      <section>
        <h2 className="text-2xl font-semibold mb-4 font-headline">Test Details</h2>
        <div className="space-y-4">
          {run.tests.map((test, index) => (
            <div key={test.id} className="border rounded-lg p-4 bg-gray-50 print-break-inside-avoid">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <StatusIcon status={test.status} />
                  <h3 className="text-lg font-semibold">{test.name}</h3>
                   <Badge variant={
                      test.status === 'passed' ? 'secondary' : test.status === 'failed' ? 'destructive' : 'default'
                    } className={
                      test.status === 'passed' ? 'bg-green-100 text-green-800' :
                      test.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }>{test.status}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{test.duration}ms</span>
                </div>
              </div>
              <p className="text-gray-600 mt-2 ml-8">{test.description}</p>
              
              {test.status === 'failed' && test.error && (
                <div className="mt-4 ml-8">
                  <h4 className="font-semibold text-red-700">Failure Reason:</h4>
                  <p className="text-sm text-red-600 font-mono">{test.error}</p>
                  
                  {test.errorLog && (
                    <div className="mt-2">
                      <h5 className="font-semibold">Error Log:</h5>
                      <pre className="bg-gray-900 text-white p-3 rounded-md text-xs overflow-x-auto">
                        <code>{test.errorLog}</code>
                      </pre>
                    </div>
                  )}

                  {test.attachments && test.attachments.length > 0 && (
                     <div className="mt-4">
                       <h5 className="font-semibold">Attachments:</h5>
                       {test.attachments.map((att, i) => (
                         <div key={i} className="mt-2 border rounded-lg overflow-hidden">
                           <Image data-ai-hint="test screenshot" src={att.path} alt={att.description} width={1280} height={720} className="w-full h-auto" />
                           <p className="p-2 text-sm text-gray-600 bg-gray-100">{att.description}</p>
                         </div>
                       ))}
                     </div>
                   )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
