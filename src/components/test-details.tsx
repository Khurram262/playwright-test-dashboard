"use client";

import * as React from "react";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { analyzeTestFailureLogs } from "@/ai/flows/analyze-test-failure-logs";
import type { Test, TestRun, TestStatus } from "@/types";
import { CheckCircle2, Clock, FileText, MinusCircle, Sparkles, XCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const StatusIcon = ({ status }: { status: Test['status'] }) => {
  if (status === 'passed') return <CheckCircle2 className="h-5 w-5 text-green-500" />;
  if (status === 'failed') return <XCircle className="h-5 w-5 text-red-500" />;
  if (status === 'skipped') return <MinusCircle className="h-5 w-5 text-yellow-500" />;
  if (status === 'interrupted') return <AlertCircle className="h-5 w-5 text-gray-500" />;
  return null;
};

const AnalyzeLogButton = ({ errorLog }: { errorLog: string }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [analysis, setAnalysis] = React.useState<string | null>(null);
  const { toast } = useToast();

  const handleAnalysis = async () => {
    setIsOpen(true);
    if (analysis) return; 

    setIsLoading(true);
    try {
      const result = await analyzeTestFailureLogs({ errorLog });
      setAnalysis(result.suggestedReasons);
    } catch (error) {
      console.error("AI analysis failed:", error);
      setAnalysis("Sorry, the AI analysis failed. Please try again later.");
      toast({
        variant: "destructive",
        title: "AI Analysis Failed",
        description: "There was an issue connecting to the AI service.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button size="sm" onClick={handleAnalysis} className="mt-4 bg-accent hover:bg-accent/90 text-accent-foreground">
        <Sparkles className="mr-2 h-4 w-4" />
        Analyze with AI
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>AI Error Log Analysis</DialogTitle>
            <DialogDescription>
              AI-powered suggestions for the test failure. This is a suggestion and may not be accurate.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none text-sm text-foreground/90 whitespace-pre-wrap rounded-md border p-4 bg-secondary/50">
                {analysis}
              </div>
            )}
            <div>
                <h4 className="font-semibold mb-2 mt-4 text-sm">Original Error Log:</h4>
                <pre className="bg-muted text-muted-foreground p-3 rounded-md text-xs overflow-x-auto">
                    <code>{errorLog}</code>
                </pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export function TestDetails({ run }: { run: TestRun }) {
  const failedTests = run.tests.filter(t => t.status === 'failed').map(t => t.id);
  const [openItems, setOpenItems] = React.useState<string[]>(failedTests);

  const getStatusClasses = (status: Test['status']) => {
    switch (status) {
      case 'passed':
        return 'border-green-500/20 bg-green-500/5';
      case 'failed':
        return 'border-red-500/20 bg-red-500/5';
      case 'skipped':
        return 'border-yellow-500/20 bg-yellow-500/5';
      case 'interrupted':
        return 'border-gray-500/20 bg-gray-500/5';
      default:
        return 'border-border';
    }
  };
  
  const getBadgeClasses = (status: TestStatus) => {
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
            return 'border-border';
    }
  }

  return (
    <Card className="print-break-inside-avoid">
      <CardHeader>
        <CardTitle>Test Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" value={openItems} onValueChange={setOpenItems} className="w-full">
          {run.tests.map((test) => (
            <AccordionItem value={test.id} key={test.id} className={cn("rounded-lg mb-2 border-l-4 px-2", getStatusClasses(test.status))}>
              <AccordionTrigger className="py-3 [&[data-state=open]>svg]:rotate-180">
                <div className="flex items-center gap-3 flex-1 text-left">
                  <StatusIcon status={test.status} />
                  <span className="font-medium flex-1">{test.name}</span>
                  <div className="flex items-center gap-4">
                    <Badge variant='outline' className={getBadgeClasses(test.status)}>{test.status}</Badge>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{test.duration > 0 ? `${test.duration}ms` : '-'}</span>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pl-10 pb-4">
                <p className="text-muted-foreground flex items-start gap-2 text-sm">
                    <FileText className="h-4 w-4 mt-0.5 shrink-0"/>
                    <span>{test.description}</span>
                </p>

                {(test.status === 'failed' || test.status === 'interrupted') && (
                  <div className="mt-4 space-y-4">
                    {test.error && (
                        <div>
                            <h4 className="font-semibold text-destructive">Failure Reason</h4>
                            <p className="text-sm text-destructive/90 font-mono bg-destructive/10 p-3 rounded-md mt-1">{test.error}</p>
                        </div>
                    )}
                    
                    {test.errorLog && <AnalyzeLogButton errorLog={test.errorLog} />}

                    {test.attachments && test.attachments.length > 0 && (
                      <div className="space-y-2 pt-4">
                        <h4 className="font-semibold">Attachments</h4>
                        {test.attachments.map((att, i) => (
                          <div key={i} className="border rounded-lg overflow-hidden max-w-2xl shadow-sm">
                            <Image data-ai-hint="test screenshot" src={att.path} alt={att.description} width={1280} height={720} className="w-full h-auto" />
                            <p className="p-2 text-sm text-muted-foreground bg-secondary/50">{att.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
