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
    FileText,
    BarChart3,
    Lightbulb
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TestRun, Test } from '@/types';
import { analyzeTestFailureLogs } from '@/ai/flows/analyze-test-failure-logs';
import ReactMarkdown from 'react-markdown';

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

    // Get all failed tests from recent runs
    const failedTests = React.useMemo(() => {
        const allFailed: Test[] = [];
        runs.forEach(run => {  // Analyze ALL runs instead of just last 10
            run.tests.forEach(test => {
                if (test.status === 'failed') {
                    allFailed.push(test);
                }
            });
        });
        return allFailed;
    }, [runs]);

    // Get tests with error logs for AI analysis
    const failedTestsWithLogs = React.useMemo(() => {
        return failedTests.filter(test => test.errorLog || test.error);
    }, [failedTests]);

    // Detect common failure patterns
    const detectPatterns = React.useCallback(() => {
        const patternMap = new Map<string, { tests: string[], count: number }>();

        failedTests.forEach(test => {
            // Combine error and errorLog for pattern detection
            const errorLog = (test.errorLog || '') + ' ' + (test.error || '');
            const errorLower = errorLog.toLowerCase();

            // Pattern detection logic
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
                    category = 'Selector/Locator Problems';
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
                tests: value.tests.slice(0, 5), // Show max 5 tests
                severity,
                icon
            });
        });

        setPatterns(detectedPatterns.sort((a, b) => b.count - a.count));
    }, [failedTests]);

    // Generate insights
    const generateInsights = React.useCallback(() => {
        const newInsights: InsightCard[] = [];

        const totalTests = runs.reduce((acc, run) => acc + run.tests.length, 0);
        const totalFailed = failedTests.length;
        const failureRate = totalTests > 0 ? (totalFailed / totalTests) * 100 : 0;

        if (failureRate < 5) {
            newInsights.push({
                title: 'Excellent Test Health',
                description: `Only ${failureRate.toFixed(1)}% of tests are failing. Your test suite is in great shape!`,
                type: 'success',
                icon: CheckCircle2
            });
        } else if (failureRate > 20) {
            newInsights.push({
                title: 'High Failure Rate Detected',
                description: `${failureRate.toFixed(1)}% of tests are failing. Consider investigating common patterns.`,
                type: 'error',
                icon: AlertTriangle
            });
        }

        // Check for flaky tests
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
                title: 'Flaky Tests Detected',
                description: `Found ${flakyCount} test${flakyCount > 1 ? 's' : ''} with inconsistent results. These need attention.`,
                type: 'warning',
                icon: TrendingUp
            });
        }

        // Pattern-based insights
        patterns.forEach(pattern => {
            if (pattern.severity === 'high') {
                newInsights.push({
                    title: `${pattern.category} Pattern`,
                    description: `${pattern.count} tests are failing with ${pattern.category.toLowerCase()}. This might indicate a systemic issue.`,
                    type: 'error',
                    icon: pattern.icon
                });
            }
        });

        setInsights(newInsights);
    }, [runs, failedTests, patterns]);

    // Run batch AI analysis
    const runBatchAnalysis = async () => {
        if (failedTestsWithLogs.length === 0) {
            setBatchAnalysis('No error logs available for analysis. Failed tests do not have detailed error information.');
            return;
        }

        setIsAnalyzing(true);
        try {
            // Combine error logs from multiple tests
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

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high': return 'border-red-500/50 bg-red-500/10 text-red-500';
            case 'medium': return 'border-amber-500/50 bg-amber-500/10 text-amber-500';
            case 'low': return 'border-blue-500/50 bg-blue-500/10 text-blue-500';
            default: return 'border-border';
        }
    };

    const getInsightColor = (type: string) => {
        switch (type) {
            case 'success': return 'border-emerald-500/30 bg-emerald-500/5';
            case 'warning': return 'border-amber-500/30 bg-amber-500/5';
            case 'error': return 'border-red-500/30 bg-red-500/5';
            case 'info': return 'border-blue-500/30 bg-blue-500/5';
            default: return 'border-border';
        }
    };

    return (
        <div className="space-y-6">
            {/* Simplified Header */}
            <Card className="border-border/50 bg-card/50">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-2">
                                <Brain className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold">AI-Powered Insights</CardTitle>
                                <CardDescription className="text-sm">
                                    Analyzing {failedTests.length} failed test{failedTests.length !== 1 ? 's' : ''} across {runs.length} run{runs.length !== 1 ? 's' : ''}
                                </CardDescription>
                            </div>
                        </div>
                        {failedTestsWithLogs.length > 0 && (
                            <Button
                                onClick={runBatchAnalysis}
                                disabled={isAnalyzing}
                                size="sm"
                                className="gap-2"
                            >
                                <Sparkles className="h-4 w-4" />
                                {isAnalyzing ? 'Analyzing...' : 'Analyze Failures'}
                            </Button>
                        )}
                    </div>
                </CardHeader>
            </Card>

            {/* Refined Insight Cards */}
            {insights.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {insights.map((insight, index) => {
                        const iconColors = {
                            success: 'text-emerald-500',
                            warning: 'text-amber-500',
                            error: 'text-red-500',
                            info: 'text-blue-500'
                        };

                        const bgColors = {
                            success: 'bg-emerald-500/10',
                            warning: 'bg-amber-500/10',
                            error: 'bg-red-500/10',
                            info: 'bg-blue-500/10'
                        };

                        return (
                            <motion.div
                                key={insight.title}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                            >
                                <Card className="h-full border-border/50">
                                    <CardContent className="pt-6">
                                        <div className="flex items-start gap-3">
                                            <div className={`rounded-lg ${bgColors[insight.type]} p-2`}>
                                                <insight.icon className={`h-5 w-5 ${iconColors[insight.type]}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-sm mb-1">{insight.title}</h3>
                                                <p className="text-xs text-muted-foreground leading-relaxed">
                                                    {insight.description}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Simplified Tabs */}
            <Tabs defaultValue="patterns" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="patterns">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Patterns
                    </TabsTrigger>
                    <TabsTrigger value="batch">
                        <Brain className="h-4 w-4 mr-2" />
                        AI Analysis
                    </TabsTrigger>
                    <TabsTrigger value="recommendations">
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Tips
                    </TabsTrigger>
                </TabsList>

                {/* Failure Patterns */}
                <TabsContent value="patterns" className="space-y-4">
                    {patterns.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2">
                            {patterns.map((pattern, index) => (
                                <motion.div
                                    key={pattern.category}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                >
                                    <Card className="border-border/50">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <pattern.icon className="h-4 w-4 text-muted-foreground" />
                                                    <CardTitle className="text-base font-semibold">{pattern.category}</CardTitle>
                                                </div>
                                                <Badge variant="outline" className={getSeverityColor(pattern.severity)}>
                                                    {pattern.severity.toUpperCase()}
                                                </Badge>
                                            </div>
                                            <CardDescription className="text-xs">
                                                {pattern.count} test{pattern.count > 1 ? 's' : ''} affected
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-wrap gap-1.5">
                                                {pattern.tests.slice(0, 3).map((testName, i) => (
                                                    <Badge key={i} variant="secondary" className="text-xs font-normal">
                                                        {testName.length > 30 ? testName.substring(0, 30) + '...' : testName}
                                                    </Badge>
                                                ))}
                                                {pattern.count > 3 && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        +{pattern.count - 3} more
                                                    </Badge>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-4" />
                                <p className="text-lg font-semibold">No Patterns Detected</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Your test failures appear to be isolated incidents.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Batch Analysis */}
                <TabsContent value="batch">
                    <Card className="border-border/50">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-primary" />
                                AI Batch Analysis
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Comprehensive analysis of test failures
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isAnalyzing ? (
                                <div className="space-y-2">
                                    <Skeleton className="h-3 w-full" />
                                    <Skeleton className="h-3 w-5/6" />
                                    <Skeleton className="h-3 w-4/6" />
                                </div>
                            ) : batchAnalysis ? (
                                <ScrollArea className="h-[350px]">
                                    <div className="prose prose-sm dark:prose-invert max-w-none pr-4">
                                        <ReactMarkdown
                                            components={{
                                                code: ({ node, ...props }) => <code className="bg-muted text-foreground px-1.5 py-0.5 rounded text-xs font-mono" {...props} />,
                                                p: ({ node, ...props }) => <p className="mb-3 text-sm leading-relaxed" {...props} />,
                                                strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
                                                ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-3 space-y-1 text-sm" {...props} />,
                                                h2: ({ node, ...props }) => <h2 className="text-base font-semibold mb-2 mt-4 first:mt-0" {...props} />,
                                            }}
                                        >
                                            {batchAnalysis}
                                        </ReactMarkdown>
                                    </div>
                                </ScrollArea>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <Brain className="h-10 w-10 text-muted-foreground/50 mb-3" />
                                    <p className="text-sm text-muted-foreground">
                                        Click "Analyze Failures" to get AI insights
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Recommendations */}
                <TabsContent value="recommendations">
                    <Card className="border-border/50">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <Lightbulb className="h-4 w-4 text-amber-500" />
                                Smart Recommendations
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Actionable tips to improve test stability
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {patterns.map((pattern, index) => (
                                <div key={index} className="rounded-lg border bg-muted/30 p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <pattern.icon className="h-3.5 w-3.5 text-muted-foreground" />
                                        <h4 className="font-semibold text-sm">{pattern.category}</h4>
                                    </div>
                                    <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-5">
                                        {pattern.category.includes('Timeout') && (
                                            <>
                                                <li>Increase timeout values for slow operations</li>
                                                <li>Add explicit waits before assertions</li>
                                                <li>Check for network latency issues</li>
                                            </>
                                        )}
                                        {pattern.category.includes('Selector') && (
                                            <>
                                                <li>Use data-testid attributes for stability</li>
                                                <li>Avoid dynamic class names</li>
                                                <li>Wait for visibility before interacting</li>
                                            </>
                                        )}
                                        {pattern.category.includes('Network') && (
                                            <>
                                                <li>Mock external API calls</li>
                                                <li>Add retry logic for requests</li>
                                                <li>Verify backend services</li>
                                            </>
                                        )}
                                        {pattern.category.includes('Assertion') && (
                                            <>
                                                <li>Review expected vs actual values</li>
                                                <li>Ensure proper test data seeding</li>
                                                <li>Check for race conditions</li>
                                            </>
                                        )}
                                    </ul>
                                </div>
                            ))}
                            {patterns.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <CheckCircle2 className="h-10 w-10 text-emerald-500/50 mb-3" />
                                    <p className="text-sm text-muted-foreground">
                                        No recommendations needed. Tests look good!
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
