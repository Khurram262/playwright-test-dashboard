
"use client";

import ReactMarkdown from 'react-markdown';
import * as React from "react";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { analyzeTestFailureLogs } from "@/ai/flows/analyze-test-failure-logs";
import type { Test, TestRun, TestStatus, TestAttachment } from "@/types";
import { CheckCircle2, Clock, FileText, MinusCircle, Sparkles, XCircle, AlertCircle, Filter, SortAsc, SortDesc, Search, ChevronsRightLeft, Copy, ChevronsUpDown, HelpCircle, Play, Ticket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const StatusIcon = ({ status, className }: { status: Test['status'], className?: string }) => {
  const props = { className: cn("h-5 w-5", className) };
  if (status === 'passed') return <CheckCircle2 {...props} className={cn(props.className, "text-green-500")} />;
  if (status === 'failed') return <XCircle {...props} className={cn(props.className, "text-red-500")} />;
  if (status === 'skipped') return <MinusCircle {...props} className={cn(props.className, "text-yellow-500")} />;
  if (status === 'interrupted') return <AlertCircle {...props} className={cn(props.className, "text-gray-500")} />;
  return null;
};

const CreateIssueDialog = ({ test, isOpen, onOpenChange }: { test: Test, isOpen: boolean, onOpenChange: (open: boolean) => void }) => {
  const { toast } = useToast();
  const [tracker, setTracker] = React.useState("github");
  const [title, setTitle] = React.useState(`Test Failed: ${test.name}`);
  const [body, setBody] = React.useState(
    `**Test:** \`${test.name}\`
**File:** \`${test.description.replace('Location: ', '')}\`

### Error
\`\`\`
${test.error || 'No error message provided.'}
\`\`\`

### Full Error Log
\`\`\`
${test.errorLog || 'No error log available.'}
\`\`\`
`
  );

  const handleCreateIssue = () => {
    // Placeholder for actual issue creation logic
    console.log("Simulating issue creation for:", tracker);
    console.log("Payload:", { title, body });

    toast({
      title: "Issue Creation Simulated",
      description: `Check the browser console for the '${tracker}' issue payload.`,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Issue</DialogTitle>
          <DialogDescription>
            This form is pre-filled with the test failure details. You can copy this content into your issue tracker.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="issue-tracker">Issue Tracker</Label>
            <Select value={tracker} onValueChange={setTracker}>
              <SelectTrigger id="issue-tracker">
                <SelectValue placeholder="Select a tracker" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="github">GitHub</SelectItem>
                <SelectItem value="jira">Jira</SelectItem>
                <SelectItem value="clickup">ClickUp</SelectItem>
                <SelectItem value="linear" disabled>Linear (coming soon)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="issue-title">Title</Label>
            <Input id="issue-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="issue-body">Body (Markdown)</Label>
            <Textarea id="issue-body" value={body} onChange={(e) => setBody(e.target.value)} className="min-h-[250px] font-mono text-xs" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleCreateIssue}>Simulate Issue Creation</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const AnalyzeLogButton = ({ test }: { test: Test }) => {
  const [isAnalysisOpen, setIsAnalysisOpen] = React.useState(false);
  const [isIssueOpen, setIsIssueOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [analysis, setAnalysis] = React.useState<string | null>(null);
  const { toast } = useToast();

  const handleAnalysis = async () => {
    setIsAnalysisOpen(true);
    if (analysis || !test.errorLog) return;

    setIsLoading(true);
    try {
      const result = await analyzeTestFailureLogs({ errorLog: test.errorLog });
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

  const handleCopyLog = () => {
    if (!test.errorLog) return;
    navigator.clipboard.writeText(test.errorLog);
    toast({
      title: "Copied to Clipboard",
      description: "The error log has been copied.",
    })
  }

  const handleCopyCommand = () => {
    const location = test.description.replace('Location: ', '');
    const command = `npx playwright test ${location}`;
    navigator.clipboard.writeText(command);
    toast({
      title: "Command Copied",
      description: "The run command has been copied to your clipboard.",
    });
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={handleCopyCommand} variant="outline">
          <Play className="mr-2 h-4 w-4" />
          Copy Run Command
        </Button>
        {test.errorLog && (
          <>
            <Button size="sm" onClick={handleAnalysis}>
              <Sparkles className="mr-2 h-4 w-4" />
              Analyze with AI
            </Button>
            <Button size="sm" variant="outline" onClick={() => setIsIssueOpen(true)}>
              <Ticket className="mr-2 h-4 w-4" />
              Create Issue
            </Button>
            <Button size="sm" variant="outline" onClick={handleCopyLog}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Log
            </Button>
          </>
        )}
      </div>
      <Dialog open={isAnalysisOpen} onOpenChange={setIsAnalysisOpen}>
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
              <div className="rounded-md border p-4 bg-secondary/50 overflow-y-auto max-h-[60vh]">
                <div className="prose prose-sm dark:prose-invert max-w-none text-sm text-foreground/90 break-words">
                  <ReactMarkdown>
                    {analysis || ''}
                  </ReactMarkdown>
                </div>
              </div>
            )}
            <div>
              <div className="flex items-center justify-between mb-2 mt-4">
                <h4 className="font-semibold text-sm">Original Error Log:</h4>
                <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => {
                  navigator.clipboard.writeText(test.errorLog || '');
                  toast({ title: "Copied", description: "Error log copied to clipboard." });
                }}>
                  <Copy className="mr-1 h-3 w-3" />
                  Copy
                </Button>
              </div>
              <div className="bg-muted text-muted-foreground p-3 rounded-md text-xs overflow-x-auto max-h-[200px] overflow-y-auto whitespace-pre-wrap font-mono">
                {test.errorLog}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <CreateIssueDialog test={test} isOpen={isIssueOpen} onOpenChange={setIsIssueOpen} />
    </>
  );
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

const getSafeAttachmentPath = (attachment: TestAttachment) => {
  const isLocalPath = !attachment.path.startsWith('http') && !attachment.path.startsWith('data:');
  if (isLocalPath) {
    // Return a transparent GIF as a placeholder for local file paths
    return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  }
  return attachment.path;
}

type TestDetailsProps = {
  run: TestRun;
  flakyTestNames?: Set<string>;
}

export function TestDetails({ run, flakyTestNames = new Set() }: TestDetailsProps) {
  const failedTestIds = run.tests.filter(t => t.status === 'failed').map(t => t.id);

  const [openItems, setOpenItems] = React.useState<string[]>(failedTestIds);
  const [filter, setFilter] = React.useState<TestStatus | "all">("all");
  const [sort, setSort] = React.useState<"default" | "duration-asc" | "duration-desc" | "name-asc" | "name-desc">("default");
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredAndSortedTests = React.useMemo(() => {
    let tests = [...run.tests];

    if (searchTerm) {
      tests = tests.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (filter !== "all") {
      tests = tests.filter(t => t.status === filter);
    }

    switch (sort) {
      case "duration-asc":
        tests.sort((a, b) => a.duration - b.duration);
        break;
      case "duration-desc":
        tests.sort((a, b) => b.duration - a.duration);
        break;
      case "name-asc":
        tests.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        tests.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }

    return tests;
  }, [run.tests, filter, sort, searchTerm]);

  const handleExpandAll = () => setOpenItems(filteredAndSortedTests.map(t => t.id));
  const handleCollapseAll = () => setOpenItems([]);


  return (
    <Card className="print-break-inside-avoid">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <CardTitle>Test Details</CardTitle>
            <CardDescription>
              Explore the results of each individual test from this run. Failed tests are expanded by default.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExpandAll} disabled={filteredAndSortedTests.length === 0}>
              <ChevronsUpDown className="mr-2 h-4 w-4" />
              Expand All
            </Button>
            <Button variant="outline" size="sm" onClick={handleCollapseAll} disabled={openItems.length === 0}>
              <ChevronsRightLeft className="mr-2 h-4 w-4" />
              Collapse All
            </Button>
          </div>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-2">
          <div className="relative w-full sm:w-auto sm:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tests by name..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filter} onValueChange={(value) => setFilter(value as any)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="passed">Passed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="skipped">Skipped</SelectItem>
              <SelectItem value="interrupted">Interrupted</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(value) => setSort(value as any)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              {sort.endsWith('-asc') ? <SortAsc className="mr-2 h-4 w-4" /> : <SortDesc className="mr-2 h-4 w-4" />}
              <SelectValue placeholder="Sort tests" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default Order</SelectItem>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="duration-asc">Duration (Shortest First)</SelectItem>
              <SelectItem value="duration-desc">Duration (Longest First)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredAndSortedTests.length > 0 ? (
          <Accordion type="multiple" value={openItems} onValueChange={setOpenItems} className="w-full space-y-2">
            {filteredAndSortedTests.map((test) => {
              const isFlaky = flakyTestNames.has(test.name);
              return (
                <AccordionItem value={test.id} key={test.id} className="border rounded-lg overflow-hidden">
                  <AccordionTrigger className="px-4 py-3 bg-secondary/30 hover:bg-secondary/60 [&[data-state=open]>svg]:rotate-180">
                    <div className="flex items-center gap-3 flex-1 text-left">
                      <StatusIcon status={test.status} />
                      <span className="font-medium flex-1">{test.name}</span>
                      <div className="flex items-center gap-4">
                        {isFlaky && (
                          <Badge variant='outline' className="border-orange-500/50 bg-orange-500/10 text-orange-700 dark:text-orange-400">
                            <HelpCircle className="mr-1.5 h-3 w-3" />
                            Flaky
                          </Badge>
                        )}
                        <Badge variant='outline' className={getBadgeClasses(test.status)}>{test.status}</Badge>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{test.duration > 0 ? `${test.duration}ms` : '-'}</span>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 bg-background">
                    <Tabs defaultValue="details">
                      <TabsList className="mb-4">
                        <TabsTrigger value="details">Details</TabsTrigger>
                        {(test.status === 'failed' || test.status === 'interrupted') && <TabsTrigger value="analysis">Analysis &amp; Actions</TabsTrigger>}
                        {test.attachments && test.attachments.length > 0 && <TabsTrigger value="attachments">Attachments</TabsTrigger>}
                      </TabsList>

                      <TabsContent value="details">
                        <div className="space-y-4">
                          <div className="flex items-start gap-3 text-sm">
                            <FileText className="h-4 w-4 mt-1 shrink-0 text-muted-foreground" />
                            <div className="flex flex-col">
                              <span className="font-semibold">Location</span>
                              <span className="text-muted-foreground font-mono text-xs">{test.description.replace('Location: ', '')}</span>
                            </div>
                          </div>
                          {(test.status === 'failed' || test.status === 'interrupted') && test.error && (
                            <div className="flex items-start gap-3 text-sm">
                              <XCircle className="h-4 w-4 mt-1 shrink-0 text-destructive" />
                              <div className="flex flex-col">
                                <span className="font-semibold text-destructive">Failure Reason</span>
                                <p className="text-sm text-destructive/90 font-mono bg-destructive/10 p-3 rounded-md mt-1">{test.error}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="analysis">
                        {(test.status === 'failed' || test.status === 'interrupted') && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-4">Copy the command to run this specific test, or use AI to suggest reasons for the failure.</p>
                            <AnalyzeLogButton test={test} />
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="attachments">
                        {test.attachments && test.attachments.length > 0 && (
                          <div className="space-y-4">
                            {test.attachments.map((att, i) => (
                              <div key={i} className="border rounded-lg overflow-hidden max-w-2xl shadow-sm">
                                <p className="p-2 text-sm text-muted-foreground bg-secondary/50 font-medium">{att.description}</p>
                                <div className="bg-muted">
                                  <Image data-ai-hint="test screenshot" src={getSafeAttachmentPath(att)} alt={att.description} width={1280} height={720} className="w-full h-auto" />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </TabsContent>

                    </Tabs>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card/50 p-12 text-center">
            <Search className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-6 text-xl font-semibold text-foreground">No matching tests found</h3>
            <p className="mt-1 text-base text-muted-foreground">
              Try adjusting your search or filter criteria to see more results.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

