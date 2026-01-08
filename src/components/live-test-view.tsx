'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
    CheckCircle2,
    XCircle,
    Clock,
    Loader2,
    SkipForward,
    Trash2,
    Activity,
    Timer,
    Target,
    Zap,
    BarChart3,
    Terminal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

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
    const { toast } = useToast();
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

    // Dynamic timer for running tests
    const [elapsedSeconds, setElapsedSeconds] = React.useState(0);

    React.useEffect(() => {
        let timer: NodeJS.Timeout;
        if (liveState.isRunning && liveState.startTime) {
            timer = setInterval(() => {
                const start = new Date(liveState.startTime!).getTime();
                const now = new Date().getTime();
                setElapsedSeconds(Math.floor((now - start) / 1000));
            }, 1000);
        } else {
            setElapsedSeconds(0);
        }
        return () => clearInterval(timer);
    }, [liveState.isRunning, liveState.startTime]);

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
                        console.warn("SSE failed after retries, switching to polling.");
                        setUsePolling(true);
                    } else {
                        setTimeout(connectSSE, 2000); // Retry connection
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

    const resetLiveTests = async () => {
        setLiveState({
            isRunning: false,
            currentTest: null,
            totalTests: 0,
            completedTests: 0,
            tests: [],
            startTime: null
        });

        try {
            const response = await fetch(`${SERVER_URL}/api/live-tests/reset`, { method: 'POST' });
            if (response.ok) {
                toast({
                    title: "Live State Reset",
                    description: "Test execution progress has been cleared.",
                });
            } else {
                throw new Error("Failed to reset on server");
            }
        } catch (error) {
            console.error("Failed to reset live tests:", error);
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'pending': return "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 text-slate-500 overflow-hidden";
            case 'running': return "border-blue-500/50 bg-blue-500/5 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 overflow-hidden";
            case 'passed': return "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 overflow-hidden";
            case 'failed': return "border-rose-500/30 bg-rose-500/5 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 overflow-hidden";
            case 'skipped': return "border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 overflow-hidden";
            default: return "";
        }
    };

    const getStatusIcon = (status: string, className?: string) => {
        switch (status) {
            case 'pending': return <Clock className={cn("h-4 w-4", className)} />;
            case 'running': return <Loader2 className={cn("h-4 w-4 animate-spin", className)} />;
            case 'passed': return <CheckCircle2 className={cn("h-4 w-4", className)} />;
            case 'failed': return <XCircle className={cn("h-4 w-4", className)} />;
            case 'skipped': return <SkipForward className={cn("h-4 w-4", className)} />;
            default: return null;
        }
    };

    const progress = liveState.totalTests > 0
        ? (liveState.completedTests / liveState.totalTests) * 100
        : 0;

    const stats = {
        passed: liveState.tests.filter(t => t.status === 'passed').length,
        failed: liveState.tests.filter(t => t.status === 'failed').length,
        skipped: liveState.tests.filter(t => t.status === 'skipped').length,
        pending: liveState.tests.filter(t => t.status === 'pending').length,
    };

    if (!liveState.isRunning && liveState.tests.length === 0) {
        return (
            <Card className="relative overflow-hidden border-dashed border-2 bg-gradient-to-br from-card to-muted/30">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Zap className="h-24 w-24 text-primary" />
                </div>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"></div>
                        <div className="relative rounded-2xl bg-primary/10 p-5 border border-primary/20">
                            <Activity className="h-10 w-10 text-primary" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Live Monitoring Ready</h3>
                    <p className="text-muted-foreground mt-2 max-w-sm">
                        Start a test run to see real-time updates and execution progress here.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="relative overflow-hidden border-border/50 shadow-2xl bg-card/50 backdrop-blur-xl border border-white/10">
            {/* Header with Glassmorphism */}
            <CardHeader className="relative border-b border-border/20 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 pb-6 overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>
                <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-4">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative"
                        >
                            {liveState.isRunning ? (
                                <>
                                    <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-full animate-pulse"></div>
                                    <div className="relative h-12 w-12 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shadow-lg shadow-blue-500/20">
                                        <Zap className="h-6 w-6 text-blue-500 animate-bounce" />
                                    </div>
                                </>
                            ) : (
                                <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shadow-lg shadow-emerald-500/20">
                                    <BarChart3 className="h-6 w-6 text-emerald-500" />
                                </div>
                            )}
                        </motion.div>
                        <div>
                            <CardTitle className="text-2xl font-black tracking-tighter bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent uppercase">
                                {liveState.isRunning ? "Live Execution" : "Execution Summary"}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                                {liveState.isRunning ? (
                                    <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-blue-500">
                                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-ping"></div>
                                        ELAPSED: {formatDuration(elapsedSeconds)}
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1.5">
                                        <CheckCircle2 className="h-3 w-3" />
                                        SEQUENCE COMPLETE
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetLiveTests}
                        className="h-9 px-4 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-all rounded-xl"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Reset Session
                    </Button>
                </div>

                {/* Progress Visualizer */}
                <div className="space-y-4 relative z-10">
                    <div className="flex items-end justify-between px-1">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-50">Throughput</span>
                            <div className="flex items-baseline gap-2">
                                <motion.span
                                    key={Math.round(progress)}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="text-4xl font-black tabular-nums tracking-tighter"
                                >
                                    {Math.round(progress)}%
                                </motion.span>
                                <span className="text-xs font-bold text-muted-foreground/60 tabular-nums">
                                    {liveState.completedTests} / {liveState.totalTests} OPS
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <AnimatePresence>
                                {stats.passed > 0 && (
                                    <motion.div
                                        key="passed-stats"
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2"
                                    >
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-xs font-black text-emerald-500 tabular-nums">{stats.passed}</span>
                                    </motion.div>
                                )}
                                {stats.failed > 0 && (
                                    <motion.div
                                        key="failed-stats"
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2"
                                    >
                                        <div className="h-2 w-2 rounded-full bg-rose-500 animate-bounce"></div>
                                        <span className="text-xs font-black text-rose-500 tabular-nums">{stats.failed}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                    <div className="relative h-2 w-full rounded-full bg-foreground/5 overflow-hidden border border-foreground/5 shadow-inner">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8, ease: "circOut" }}
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                        />
                    </div>
                </div>
            </CardHeader>

            {/* Test List */}
            <CardContent className="p-0 bg-gradient-to-b from-transparent to-muted/5">
                <ScrollArea className="h-[500px]" ref={scrollRef}>
                    <div className="p-6 space-y-4">
                        <AnimatePresence mode="popLayout">
                            {liveState.tests.map((test, index) => {
                                const isRunning = test.status === 'running';
                                const duration = test.startTime && test.endTime
                                    ? ((new Date(test.endTime).getTime() - new Date(test.startTime).getTime()) / 1000).toFixed(1)
                                    : null;

                                return (
                                    <motion.div
                                        key={`${test.name}-${index}`}
                                        layout
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        className={cn(
                                            "group relative flex items-center justify-between p-4 rounded-2xl border transition-all duration-300",
                                            getStatusStyles(test.status),
                                            isRunning && "shadow-2xl shadow-blue-500/20 bg-blue-500/10 border-blue-500/40 ring-1 ring-blue-500/20"
                                        )}
                                        ref={isRunning ? runningTestRef : null}
                                    >
                                        <div className="flex items-center gap-4 flex-1 min-w-0 relative z-10">
                                            <div className={cn(
                                                "flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-300",
                                                isRunning && "bg-blue-500 shadow-lg shadow-blue-500/40"
                                            )}>
                                                {getStatusIcon(test.status, cn("h-5 w-5", isRunning && "text-white"))}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className={cn(
                                                        "text-sm font-bold tracking-tight truncate",
                                                        isRunning && "text-blue-600 dark:text-blue-300"
                                                    )}>
                                                        {test.name.replace(/^UI\//, '')}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3 mt-1 opacity-60">
                                                    <span className="text-[9px] font-black uppercase tracking-widest">
                                                        {test.status}
                                                    </span>
                                                    {duration && (
                                                        <span className="text-[9px] font-black tabular-nums">
                                                            {duration}s
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-1 relative z-10">
                                            {isRunning && (
                                                <motion.div
                                                    animate={{ opacity: [1, 0.5, 1] }}
                                                    transition={{ repeat: Infinity, duration: 1 }}
                                                    className="flex items-center gap-1.5 text-[9px] font-black tracking-widest text-blue-500"
                                                >
                                                    STREAMING
                                                </motion.div>
                                            )}
                                            {test.status === 'passed' && <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />}
                                            {test.status === 'failed' && <div className="h-1.5 w-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />}
                                        </div>

                                        {/* Running Background Pulse */}
                                        {isRunning && (
                                            <motion.div
                                                layoutId="active-bg"
                                                className="absolute inset-0 bg-blue-500/5 rounded-2xl pointer-events-none"
                                                transition={{ duration: 0.5 }}
                                            />
                                        )}
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </ScrollArea>

                {/* Footer Status Bar with Cyberpunk feel */}
                <div className="px-6 py-4 border-t border-border/20 bg-muted/30 backdrop-blur-md flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{stats.passed} OK</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{stats.failed} FAIL</span>
                        </div>
                    </div>
                    {liveState.startTime && (
                        <div className="flex items-center gap-2 text-muted-foreground/40">
                            <Terminal className="h-3 w-3" />
                            <span className="text-[9px] font-black uppercase tracking-widest">
                                SESSION_START: {new Date(liveState.startTime).toLocaleTimeString()}
                            </span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
