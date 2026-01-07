'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Play, CheckCircle2, XCircle, Clock, Loader2, SkipForward, Trash2, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveTest {
    name: string;
    status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
    startTime: string | null;
    endTime: string | null;
}

interface LiveTestState {
    isRunning: boolean;
    currentTest: string | null;
    totalTests: number;
    completedTests: number;
    tests: LiveTest[];
    startTime: string | null;
}

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';

export function LiveTestView() {
    const [liveState, setLiveState] = React.useState<LiveTestState>({
        isRunning: false,
        currentTest: null,
        totalTests: 0,
        completedTests: 0,
        tests: [],
        startTime: null
    });

    const scrollRef = React.useRef<HTMLDivElement>(null);
    const runningTestRef = React.useRef<HTMLDivElement>(null);
    const [usePolling, setUsePolling] = React.useState(false);

    // SSE Connection
    React.useEffect(() => {
        if (usePolling) return;

        let eventSource: EventSource | null = null;
        let retryCount = 0;
        const maxRetries = 3;

        const connectSSE = () => {
            try {
                eventSource = new EventSource(`${SERVER_URL}/api/live-tests/stream`);

                eventSource.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    setLiveState(data);
                    retryCount = 0;
                };

                eventSource.onerror = () => {
                    eventSource?.close();
                    retryCount++;
                    if (retryCount >= maxRetries) {
                        setUsePolling(true);
                    }
                };
            } catch (error) {
                setUsePolling(true);
            }
        };

        connectSSE();

        return () => {
            eventSource?.close();
        };
    }, [usePolling]);

    // Fallback polling
    React.useEffect(() => {
        if (!usePolling) return;

        const pollInterval = setInterval(async () => {
            try {
                const response = await fetch(`${SERVER_URL}/api/live-tests/status`);
                if (response.ok) {
                    const data = await response.json();
                    setLiveState(data);
                }
            } catch (error) {
                console.error('Polling error:', error);
            }
        }, 1000);

        return () => clearInterval(pollInterval);
    }, [usePolling]);

    // Auto-scroll to running test
    React.useEffect(() => {
        if (liveState.isRunning && runningTestRef.current) {
            runningTestRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [liveState.currentTest]);

    const clearLiveTests = () => {
        setLiveState({
            isRunning: false,
            currentTest: null,
            totalTests: 0,
            completedTests: 0,
            tests: [],
            startTime: null
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="h-4 w-4 text-gray-400" />;
            case 'running':
                return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
            case 'passed':
                return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case 'failed':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'skipped':
                return <SkipForward className="h-4 w-4 text-yellow-500" />;
            default:
                return null;
        }
    };

    const getStatusBadge = (status: string) => {
        const baseClass = "px-2.5 py-0.5 text-xs font-semibold rounded-full";
        switch (status) {
            case 'pending':
                return <span className={cn(baseClass, "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300")}>Pending</span>;
            case 'running':
                return <span className={cn(baseClass, "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 animate-pulse")}>Running</span>;
            case 'passed':
                return <span className={cn(baseClass, "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400")}>Passed</span>;
            case 'failed':
                return <span className={cn(baseClass, "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400")}>Failed</span>;
            case 'skipped':
                return <span className={cn(baseClass, "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400")}>Skipped</span>;
            default:
                return null;
        }
    };

    const progress = liveState.totalTests > 0
        ? (liveState.completedTests / liveState.totalTests) * 100
        : 0;

    const passedCount = liveState.tests.filter(t => t.status === 'passed').length;
    const failedCount = liveState.tests.filter(t => t.status === 'failed').length;
    const skippedCount = liveState.tests.filter(t => t.status === 'skipped').length;

    if (!liveState.isRunning && liveState.tests.length === 0) {
        return (
            <Card className="border-dashed">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Activity className="h-5 w-5 text-primary" />
                        Live Test Execution
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="rounded-full bg-muted p-4 mb-4">
                            <Play className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-base font-medium text-foreground">No active test run</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Click "Run All Tests" to start monitoring live test execution
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden border-primary/20 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                        {liveState.isRunning ? (
                            <>
                                <div className="relative">
                                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                                    <div className="absolute inset-0 bg-primary/20 blur-md rounded-full animate-pulse"></div>
                                </div>
                                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent font-bold">
                                    Tests Running...
                                </span>
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-6 w-6 text-green-500" />
                                <span className="text-green-700 dark:text-green-400 font-bold">Test Run Complete</span>
                            </>
                        )}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearLiveTests}
                            className="text-muted-foreground hover:text-destructive"
                        >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Clear
                        </Button>
                    </div>
                </div>

                <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground font-medium">
                            Progress: {liveState.completedTests} / {liveState.totalTests} tests
                        </span>
                        <div className="flex items-center gap-3">
                            {passedCount > 0 && (
                                <div className="flex items-center gap-1.5 bg-green-100 dark:bg-green-900/20 px-3 py-1 rounded-full">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                    <span className="text-xs font-semibold text-green-700 dark:text-green-400">{passedCount}</span>
                                </div>
                            )}
                            {failedCount > 0 && (
                                <div className="flex items-center gap-1.5 bg-red-100 dark:bg-red-900/20 px-3 py-1 rounded-full">
                                    <XCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                                    <span className="text-xs font-semibold text-red-700 dark:text-red-400">{failedCount}</span>
                                </div>
                            )}
                            {skippedCount > 0 && (
                                <div className="flex items-center gap-1.5 bg-yellow-100 dark:bg-yellow-900/20 px-3 py-1 rounded-full">
                                    <SkipForward className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400" />
                                    <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-400">{skippedCount}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="relative">
                        <Progress value={progress} className="h-3 bg-secondary" />
                    </div>

                    <p className="text-xs text-muted-foreground text-right font-medium">
                        {progress.toFixed(1)}% Complete
                    </p>
                </div>
            </CardHeader>

            <CardContent className="p-6">
                <ScrollArea className="h-[500px] pr-4" ref={scrollRef}>
                    <div className="space-y-2">
                        {liveState.tests.map((test, index) => {
                            const isRunning = test.status === 'running';
                            const duration = test.startTime && test.endTime
                                ? ((new Date(test.endTime).getTime() - new Date(test.startTime).getTime()) / 1000).toFixed(2)
                                : null;

                            return (
                                <div
                                    key={index}
                                    ref={isRunning ? runningTestRef : null}
                                    className={cn(
                                        "group relative flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300",
                                        isRunning && "border-blue-400 bg-blue-50 dark:bg-blue-950/30 shadow-md scale-[1.02]",
                                        test.status === 'passed' && "border-green-200 dark:border-green-900/30 bg-green-50/50 dark:bg-green-950/20 hover:bg-green-100/70 dark:hover:bg-green-950/30",
                                        test.status === 'failed' && "border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/20 hover:bg-red-100/70 dark:hover:bg-red-950/30",
                                        test.status === 'pending' && "border-gray-200 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/20",
                                        test.status === 'skipped' && "border-yellow-200 dark:border-yellow-900/30 bg-yellow-50/30 dark:bg-yellow-950/20"
                                    )}
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="flex-shrink-0">
                                            {getStatusIcon(test.status)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={cn(
                                                "text-sm font-medium truncate",
                                                isRunning && "text-blue-700 dark:text-blue-300 font-semibold"
                                            )}>
                                                {test.name.replace(/^UI\//, '')}
                                            </p>
                                            {duration && (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                                    <span className="text-xs text-muted-foreground">
                                                        {duration}s
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {getStatusBadge(test.status)}
                                    </div>

                                    {isRunning && (
                                        <div className="absolute inset-0 rounded-xl border-2 border-blue-400 animate-pulse pointer-events-none"></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
