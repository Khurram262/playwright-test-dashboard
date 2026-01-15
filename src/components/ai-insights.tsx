'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Sparkles,
    Brain,
    Target,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Clock,
    Zap,
    BarChart3,
    Lightbulb,
    Bot,
    ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TestRun, Test } from '@/types';
import { analyzeTestFailureLogs } from '@/ai/flows/analyze-test-failure-logs';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

type AIInsightsProps = {
    runs: TestRun[];
};

type FailurePattern = {
    category: string;
    count: number;
    tests: string[];
    severity: 'high' | 'medium' | 'low';
    icon: React.ElementType;
};

type InsightCard = {
    title: string;
    description: string;
    type: 'success' | 'warning' | 'error' | 'info';
    icon: React.ElementType;
};

export function AIInsights({ runs }: AIInsightsProps) {
    const [isAnalyzing, setIsAnalyzing] = React.useState(false);
    const [batchAnalysis, setBatchAnalysis] = React.useState<string | null>(null);
    const [patterns, setPatterns] = React.useState<FailurePattern[]>([]);
    const [insights, setInsights] = React.useState<InsightCard[]>([]);

    const failedTests = React.useMemo(() => {
        const allFailed: Test[] = [];
        runs.forEach(run => {
            run.tests.forEach(test => {
                if (test.status === 'failed') {
                    allFailed.push(test);
                }
            });
        });
        return allFailed;
    }, [runs]);

    const failedTestsWithLogs = React.useMemo(() => {
        return failedTests.filter(test => test.errorLog || test.error);
    }, [failedTests]);

    const detectPatterns = React.useCallback(() => {
        const patternMap = new Map<string, { tests: string[], count: number }>();

        failedTests.forEach(test => {
            const errorLog = (test.errorLog || '') + ' ' + (test.error || '');
            const errorLower = errorLog.toLowerCase();

            if (errorLower.includes('timeout') || errorLower.includes('timed out')) {
                const key = 'timeout';
                const existing = patternMap.get(key) || { tests: [], count: 0 };
                existing.tests.push(test.name);
                existing.count++;
                patternMap.set(key, existing);
            }

            if (errorLower.includes('locator') || errorLower.includes('selector') || errorLower.includes('element')) {
                const key = 'selector';
                const existing = patternMap.get(key) || { tests: [], count: 0 };
                existing.tests.push(test.name);
                existing.count++;
                patternMap.set(key, existing);
            }

            if (errorLower.includes('network') || errorLower.includes('econnrefused') || errorLower.includes('fetch') || errorLower.includes('connection')) {
                const key = 'network';
                const existing = patternMap.get(key) || { tests: [], count: 0 };
                existing.tests.push(test.name);
                existing.count++;
                patternMap.set(key, existing);
            }

            if (errorLower.includes('assertion') || errorLower.includes('expect') || errorLower.includes('received') || errorLower.includes('toequal')) {
                const key = 'assertion';
                const existing = patternMap.get(key) || { tests: [], count: 0 };
                existing.tests.push(test.name);
                existing.count++;
                patternMap.set(key, existing);
            }
        });

        const detectedPatterns: FailurePattern[] = [];

        patternMap.forEach((value, key) => {
            const severity = value.count > 5 ? 'high' : value.count > 2 ? 'medium' : 'low';
            let category = '';
            let icon = AlertTriangle;

            switch (key) {
                case 'timeout':
                    category = 'Timeout Issues';
                    icon = Clock;
                    break;
                case 'selector':
                    category = 'Selector Problems';
                    icon = Target;
                    break;
                case 'network':
                    category = 'Network Failures';
                    icon = Zap;
                    break;
                case 'assertion':
                    category = 'Assertion Failures';
                    icon = XCircle;
                    break;
            }

            detectedPatterns.push({
                category,
                count: value.count,
                tests: value.tests.slice(0, 5),
                severity,
                icon
            });
        });

        setPatterns(detectedPatterns.sort((a, b) => b.count - a.count));
    }, [failedTests]);

    const generateInsights = React.useCallback(() => {
        const newInsights: InsightCard[] = [];

        const totalTests = runs.reduce((acc, run) => acc + run.tests.length, 0);
        const totalFailed = failedTests.length;
        const failureRate = totalTests > 0 ? (totalFailed / totalTests) * 100 : 0;

        if (failureRate < 5) {
            newInsights.push({
                title: 'High Stability',
                description: `Only ${failureRate.toFixed(1)}% failure rate. Maintain current practices.`,
                type: 'success',
                icon: CheckCircle2
            });
        } else if (failureRate > 20) {
            newInsights.push({
                title: 'Critical Failure Rate',
                description: `${failureRate.toFixed(1)}% of tests are failing. Immediate investigation recommended.`,
                type: 'error',
                icon: AlertTriangle
            });
        }

        const testOccurrences = new Map<string, { passed: number, failed: number }>();
        runs.forEach(run => {
            run.tests.forEach(test => {
                const existing = testOccurrences.get(test.name) || { passed: 0, failed: 0 };
                if (test.status === 'passed') existing.passed++;
                if (test.status === 'failed') existing.failed++;
                testOccurrences.set(test.name, existing);
            });
        });

        let flakyCount = 0;
        testOccurrences.forEach((stats) => {
            if (stats.passed > 0 && stats.failed > 0) flakyCount++;
        });

        if (flakyCount > 0) {
            newInsights.push({
                title: 'Flakiness Detected',
                description: `${flakyCount} tests showing inconsistent results across runs.`,
                type: 'warning',
                icon: TrendingUp
            });
        }

        patterns.forEach(pattern => {
            if (pattern.severity === 'high') {
                newInsights.push({
                    title: `${pattern.category} Spike`,
                    description: `High volume of ${pattern.category.toLowerCase()} (${pattern.count} tests).`,
                    type: 'error',
                    icon: pattern.icon
                });
            }
        });

        setInsights(newInsights);
    }, [runs, failedTests, patterns]);

    const runBatchAnalysis = async () => {
        if (failedTestsWithLogs.length === 0) {
            setBatchAnalysis('No error logs available for analysis. Failed tests do not have detailed error information.');
            return;
        }

        setIsAnalyzing(true);
        try {
            const combinedLogs = failedTestsWithLogs.slice(0, 5).map((test, i) =>
                `### Test ${i + 1}: ${test.name}\n${test.errorLog || test.error}\n\n`
            ).join('');

            const result = await analyzeTestFailureLogs({
                errorLog: `Analyzing ${failedTests.length} failed tests (${failedTestsWithLogs.length} with error logs). Here are the top ${Math.min(5, failedTestsWithLogs.length)}:\n\n${combinedLogs}`
            });

            setBatchAnalysis(result.suggestedReasons);
        } catch (error) {
            console.error('Batch analysis failed:', error);
            setBatchAnalysis('Failed to analyze. Please try again later.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    React.useEffect(() => {
        detectPatterns();
    }, [detectPatterns]);

    React.useEffect(() => {
        generateInsights();
    }, [generateInsights]);

    const getSeverityBadgeClasses = (severity: string) => {
        switch (severity) {
            case 'high': return 'bg-red-500/15 text-red-600 dark:text-red-400 hover:bg-red-500/25 border-red-200 dark:border-red-900';
            case 'medium': return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 border-amber-200 dark:border-amber-900';
            case 'low': return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 hover:bg-blue-500/25 border-blue-200 dark:border-blue-900';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    return (
        <div className="space-y-6 relative">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

            {/* Main Header Card */}
            <Card className="border-border/40 bg-gradient-to-br from-card/80 via-card/50 to-muted/20 backdrop-blur-md shadow-sm overflow-hidden relative">
                <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl blur opacity-30" />
                                <div className="relative rounded-xl bg-gradient-to-br from-violet-100 to-indigo-50 dark:from-violet-950/50 dark:to-indigo-900/50 p-3 border border-indigo-100 dark:border-indigo-800">
                                    <Bot className="h-6 w-6 text-violet-600 dark:text-violet-300" />
                                </div>
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
                                    AI-Powered Insights
                                </CardTitle>
                                <CardDescription className="text-sm font-medium text-muted-foreground/80 mt-1">
                                    Analyzing <span className="text-foreground">{failedTests.length} failures</span> across <span className="text-foreground">{runs.length} runs</span>
                                </CardDescription>
                            </div>
                        </div>
                        {failedTestsWithLogs.length > 0 && (
                            <Button
                                onClick={runBatchAnalysis}
                                disabled={isAnalyzing}
                                className={cn(
                                    "relative overflow-hidden group border-0 shadow-lg transition-all active:scale-95",
                                    "bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:via-indigo-500 hover:to-purple-500 text-white"
                                )}
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                <Sparkles className={cn("mr-2 h-4 w-4 transition-transform group-hover:rotate-12", isAnalyzing && "animate-spin")} />
                                <span>{isAnalyzing ? 'Analyzing Logs...' : 'Analyze Failures'}</span>
                            </Button>
                        )}
                    </div>
                </CardHeader>
            </Card>

            {/* Quick Insights Grid */}
            <AnimatePresence>
                {insights.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {insights.map((insight, index) => {
                            const styles = {
                                success: { border: 'border-emerald-200 dark:border-emerald-900', bg: 'bg-emerald-50/50 dark:bg-emerald-950/20', icon: 'text-emerald-600 dark:text-emerald-400', iconBg: 'bg-emerald-100 dark:bg-emerald-900/50' },
                                warning: { border: 'border-amber-200 dark:border-amber-900', bg: 'bg-amber-50/50 dark:bg-amber-950/20', icon: 'text-amber-600 dark:text-amber-400', iconBg: 'bg-amber-100 dark:bg-amber-900/50' },
                                error: { border: 'border-red-200 dark:border-red-900', bg: 'bg-red-50/50 dark:bg-red-950/20', icon: 'text-red-600 dark:text-red-400', iconBg: 'bg-red-100 dark:bg-red-900/50' },
                                info: { border: 'border-blue-200 dark:border-blue-900', bg: 'bg-blue-50/50 dark:bg-blue-950/20', icon: 'text-blue-600 dark:text-blue-400', iconBg: 'bg-blue-100 dark:bg-blue-900/50' }
                            }[insight.type];

                            return (
                                <motion.div
                                    key={insight.title}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                >
                                    <div className={cn("h-full rounded-xl border p-4 shadow-sm backdrop-blur-sm transition-all hover:shadow-md", styles.border, styles.bg)}>
                                        <div className="flex items-start gap-3">
                                            <div className={cn("rounded-lg p-2 shrink-0", styles.iconBg)}>
                                                <insight.icon className={cn("h-5 w-5", styles.icon)} />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-sm text-foreground">{insight.title}</h4>
                                                <p className="text-xs text-muted-foreground mt-1 leading-snug">{insight.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </AnimatePresence>

            {/* Detailed Tabs */}
            <div className="rounded-xl border border-border/40 bg-background/40 backdrop-blur-xl shadow-sm p-1">
                <Tabs defaultValue="patterns" className="w-full">
                    <div className="px-4 pt-4 pb-2">
                        <TabsList className="w-full bg-muted/40 p-1 rounded-lg grid grid-cols-3 md:w-[400px]">
                            <TabsTrigger value="patterns" className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all text-xs font-medium">
                                <BarChart3 className="h-3.5 w-3.5 mr-2" /> Patterns
                            </TabsTrigger>
                            <TabsTrigger value="batch" className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all text-xs font-medium">
                                <Brain className="h-3.5 w-3.5 mr-2" /> AI Deep Dive
                            </TabsTrigger>
                            <TabsTrigger value="recommendations" className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all text-xs font-medium">
                                <Lightbulb className="h-3.5 w-3.5 mr-2" /> Suggestions
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="p-4 sm:p-6 min-h-[400px]">
                        <TabsContent value="patterns" className="mt-0 space-y-4 focus-visible:outline-none">
                            {patterns.length > 0 ? (
                                <div className="grid gap-4 md:grid-cols-2">
                                    {patterns.map((pattern, index) => (
                                        <motion.div
                                            key={pattern.category}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="group relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-card to-muted/20 p-5 hover:border-primary/20 transition-all"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="rounded-md bg-muted p-2 group-hover:bg-primary/10 transition-colors">
                                                        <pattern.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-sm">{pattern.category}</h3>
                                                        <p className="text-xs text-muted-foreground">{pattern.count} failures detected</p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className={getSeverityBadgeClasses(pattern.severity)}>
                                                    {pattern.severity} severity
                                                </Badge>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">Affected Tests</p>
                                                {pattern.tests.slice(0, 3).map((test, i) => (
                                                    <div key={i} className="flex items-center gap-2 text-xs text-foreground/80 bg-background/50 p-1.5 rounded border border-border/30">
                                                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                                        <span className="truncate">{test}</span>
                                                    </div>
                                                ))}
                                                {pattern.count > 3 && (
                                                    <p className="text-xs text-muted-foreground pl-2">+ {pattern.count - 3} more tests</p>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-border/50 rounded-xl bg-muted/5">
                                    <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-4 mb-4">
                                        <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground">No Patterns Detected</h3>
                                    <p className="text-sm text-muted-foreground max-w-sm mt-2">
                                        Great job! We couldn't find any common failure patterns in your recent test runs.
                                    </p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="batch" className="mt-0 focus-visible:outline-none">
                            <div className="rounded-xl border border-border/40 bg-gradient-to-br from-card via-card/50 to-muted/10 p-1">
                                <div className="p-4 border-b border-border/30 bg-muted/20 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-violet-500" />
                                        <span className="text-sm font-semibold">Log Analysis Results</span>
                                    </div>
                                    <Badge variant="outline" className="bg-background/50">AI Generated</Badge>
                                </div>
                                <ScrollArea className="h-[350px] w-full bg-background/30 p-4 sm:p-6">
                                    {isAnalyzing ? (
                                        <div className="space-y-4 animate-pulse">
                                            <div className="h-4 bg-muted rounded w-3/4" />
                                            <div className="space-y-2">
                                                <div className="h-3 bg-muted/50 rounded" />
                                                <div className="h-3 bg-muted/50 rounded w-5/6" />
                                                <div className="h-3 bg-muted/50 rounded w-4/6" />
                                            </div>
                                            <div className="h-4 bg-muted rounded w-1/2 mt-6" />
                                            <div className="space-y-2">
                                                <div className="h-3 bg-muted/50 rounded" />
                                                <div className="h-3 bg-muted/50 rounded w-11/12" />
                                            </div>
                                        </div>
                                    ) : batchAnalysis ? (
                                        <div className="prose prose-sm dark:prose-invert max-w-none">
                                            <ReactMarkdown
                                                components={{
                                                    code: ({ node, ...props }) => <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-xs font-mono border border-primary/20" {...props} />,
                                                    // @ts-ignore
                                                    h3: ({ node, ...props }) => <h3 className="text-sm font-bold text-foreground mt-4 mb-2 flex items-center gap-2 border-b border-border/50 pb-1" {...props} />,
                                                    ul: ({ node, ...props }) => <ul className="list-none space-y-2 pl-0 my-3" {...props} />,
                                                    // @ts-ignore
                                                    li: ({ node, ...props }) => <li className="flex gap-2 text-muted-foreground text-xs leading-relaxed before:content-['•'] before:text-primary before:font-bold" {...props} />,
                                                }}
                                            >
                                                {batchAnalysis}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center py-12 text-center">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 flex items-center justify-center mb-4">
                                                <Brain className="h-8 w-8 text-violet-500/70" />
                                            </div>
                                            <h3 className="text-foreground font-semibold mb-2">Ready to Analyze</h3>
                                            <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6">
                                                Click the "Analyze Failures" button above to generate a comprehensive report of your test failures.
                                            </p>
                                        </div>
                                    )}
                                </ScrollArea>
                            </div>
                        </TabsContent>

                        <TabsContent value="recommendations" className="mt-0 focus-visible:outline-none">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {patterns.map((pattern, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-b from-card to-background p-5 hover:shadow-lg transition-all group"
                                    >
                                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <pattern.icon className="h-16 w-16" />
                                        </div>

                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-1.5">
                                                <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                            </div>
                                            <h4 className="font-semibold text-sm">{pattern.category} Fixes</h4>
                                        </div>

                                        <ul className="space-y-2">
                                            {pattern.category.includes('Timeout') && (
                                                <>
                                                    <li className="flex items-start gap-2 text-xs text-muted-foreground"><ArrowRight className="h-3 w-3 mt-0.5 text-primary" /> Increase timeout values for slow ops</li>
                                                    <li className="flex items-start gap-2 text-xs text-muted-foreground"><ArrowRight className="h-3 w-3 mt-0.5 text-primary" /> Add explicit waits before assertions</li>
                                                </>
                                            )}
                                            {pattern.category.includes('Selector') && (
                                                <>
                                                    <li className="flex items-start gap-2 text-xs text-muted-foreground"><ArrowRight className="h-3 w-3 mt-0.5 text-primary" /> Use data-testid attributes</li>
                                                    <li className="flex items-start gap-2 text-xs text-muted-foreground"><ArrowRight className="h-3 w-3 mt-0.5 text-primary" /> Avoid dynamic class names</li>
                                                </>
                                            )}
                                            {pattern.category.includes('Network') && (
                                                <>
                                                    <li className="flex items-start gap-2 text-xs text-muted-foreground"><ArrowRight className="h-3 w-3 mt-0.5 text-primary" /> Mock unstable external APIs</li>
                                                    <li className="flex items-start gap-2 text-xs text-muted-foreground"><ArrowRight className="h-3 w-3 mt-0.5 text-primary" /> Check for race conditions in fetch</li>
                                                </>
                                            )}
                                            {pattern.category.includes('Assertion') && (
                                                <>
                                                    <li className="flex items-start gap-2 text-xs text-muted-foreground"><ArrowRight className="h-3 w-3 mt-0.5 text-primary" /> Review test data isolation</li>
                                                    <li className="flex items-start gap-2 text-xs text-muted-foreground"><ArrowRight className="h-3 w-3 mt-0.5 text-primary" /> Debug with visible: true assertions</li>
                                                </>
                                            )}
                                        </ul>
                                    </motion.div>
                                ))}

                                {patterns.length === 0 && (
                                    <div className="col-span-full flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-border/50 bg-muted/5">
                                        <Sparkles className="h-10 w-10 text-muted-foreground/30 mb-3" />
                                        <p className="text-sm font-medium text-foreground">No specific recommendations</p>
                                        <p className="text-xs text-muted-foreground mt-1">Your test suite health looks optimal!</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}
