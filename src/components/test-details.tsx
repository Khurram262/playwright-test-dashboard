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
import type { TestRun, Test } from "@/types";
import { CheckCircle2, Clock, FileText, MinusCircle, Sparkles, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const StatusIcon = ({ status }: { status: TestStatus['status'] }) => {
  if (status === 'passed') return <CheckCircle2 className="h-5 w-5 text-green-500" />;
  if (status === 'failed') return <XCircle className="h-5 w-5 text-red-500" />;
  if (status === 'skipped') return <MinusCircle className="h-5 w-5 text-yellow-500" />;
  return null;
};

const AnalyzeLogButton = ({ errorLog }: { errorLog: string }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [analysis, setAnalysis] = React.useState<string | null>(null);
  const { toast } = useToast();

  const handleAnalysis = async () => {
    setIsOpen(true);
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
              AI-powered suggestions for the test failure.
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
                <h4 className="font-semibold mb-2">Original Error Log:</h4>
                <pre className="bg-gray-900 text-white p-3 rounded-md text-xs overflow-x-auto">
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

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Test Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" value={openItems} onValueChange={setOpenItems}>
          {run.tests.map((test) => (
            <AccordionItem value={test.id} key={test.id}>
              <AccordionTrigger>
                <div className="flex items-center gap-3 flex-1 text-left">
                  <StatusIcon status={test.status} />
                  <span className="font-medium flex-1">{test.name}</span>
                  <div className="flex items-center gap-4">
                    <Badge variant={
                      test.status === 'passed' ? 'secondary' : test.status === 'failed' ? 'destructive' : 'default'
                    } className={
                      test.status === 'passed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      test.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }>{test.status}</Badge>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{test.duration > 0 ? `${test.duration}ms` : '-'}</span>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pl-10">
                <p className="text-muted-foreground flex items-start gap-2">
                    <FileText className="h-4 w-4 mt-1 shrink-0"/>
                    <span>{test.description}</span>
                </p>

                {test.status === 'failed' && (
                  <div className="mt-4 space-y-4">
                    {test.error && (
                        <div>
                            <h4 className="font-semibold text-destructive">Failure Reason</h4>
                            <p className="text-sm text-destructive/90 font-mono bg-destructive/10 p-2 rounded-md mt-1">{test.error}</p>
                        </div>
                    )}
                    
                    {test.errorLog && <AnalyzeLogButton errorLog={test.errorLog} />}

                    {test.attachments && test.attachments.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold">Attachments</h4>
                        {test.attachments.map((att, i) => (
                          <div key={i} className="border rounded-lg overflow-hidden max-w-2xl">
                            <Image data-ai-hint="test screenshot" src={att.path} alt={att.description} width={1280} height={720} className="w-full h-auto" />
                            <p className="p-2 text-sm text-muted-foreground bg-secondary">{att.description}</p>
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
