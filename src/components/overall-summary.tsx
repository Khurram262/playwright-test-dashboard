'use client';

import * as React from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Pie,
    PieChart,
    XAxis,
    YAxis,
    Cell,
    ResponsiveContainer,
} from 'recharts';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from '@/components/ui/chart';
import type { TestRun } from '@/types';
import { getTestRunSummary } from '@/lib/utils';
import { Briefcase, CheckCircle2, HelpCircle, Package, TrendingUp, Activity, Zap, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const chartConfig = {
    passed: { label: 'Passed', color: 'hsl(var(--chart-1))' },
    failed: { label: 'Failed', color: 'hsl(var(--chart-3))' },
    skipped: { label: 'Skipped', color: 'hsl(var(--chart-4))' },
    interrupted: { label: 'Interrupted', color: 'hsl(var(--chart-5))' },
    total: { label: 'Total', color: 'hsl(var(--primary))' },
};

const PIE_COLORS = {
    passed: "hsl(var(--chart-1))",
    failed: "hsl(var(--chart-3))",
    skipped: "hsl(var(--chart-4))",
    interrupted: "hsl(var(--chart-5))",
};

type OverallSummaryProps = {
    runs: TestRun[];
    flakyTestsCount: number;
};

export function OverallSummary({ runs, flakyTestsCount }: OverallSummaryProps) {
    const overallSummary = React.useMemo(() => {
        let passed = 0;
        let failed = 0;
        let skipped = 0;
        let interrupted = 0;
        let totalTests = 0;

        for (const run of runs) {
            const summary = getTestRunSummary(run);
            passed += summary.passed;
            failed += summary.failed;
            skipped += summary.skipped;
            interrupted += summary.interrupted;
            totalTests += summary.total;
        }

        return {
            passed,
            failed,
            skipped,
            interrupted,
            totalTests,
            totalRuns: runs.length,
            passPercentage: totalTests > 0 ? (passed / totalTests) * 100 : 0,
        };
    }, [runs]);

    const pieChartData = [
        { name: 'passed', value: overallSummary.passed, fill: PIE_COLORS.passed },
        { name: 'failed', value: overallSummary.failed, fill: PIE_COLORS.failed },
        { name: 'skipped', value: overallSummary.skipped, fill: PIE_COLORS.skipped },
        { name: 'interrupted', value: overallSummary.interrupted, fill: PIE_COLORS.interrupted },
    ];

    const historicalData = React.useMemo(() => {
        return runs.map(run => {
            const summary = getTestRunSummary(run);
            return {
                date: new Date(run.executionDate),
                ...summary
            }
        }).slice(0, 15).reverse();
    }, [runs]);

    const statCards = [
        {
            title: "Total Runs",
            value: overallSummary.totalRuns,
            description: "Test execution sessions",
            icon: Briefcase,
            gradient: "from-blue-500/20 to-cyan-500/20",
            iconColor: "text-blue-500",
            bgGlow: "bg-blue-500/10"
        },
        {
            title: "Total Tests",
            value: overallSummary.totalTests,
            description: "Across all executions",
            icon: Package,
            gradient: "from-violet-500/20 to-purple-500/20",
            iconColor: "text-violet-500",
            bgGlow: "bg-violet-500/10"
        },
        {
            title: "Pass Rate",
            value: `${overallSummary.passPercentage.toFixed(1)}%`,
            description: `${overallSummary.passed} / ${overallSummary.totalTests} passed`,
            icon: CheckCircle2,
            gradient: "from-emerald-500/20 to-green-500/20",
            iconColor: "text-emerald-500",
            bgGlow: "bg-emerald-500/10"
        },
        {
            title: "Flaky Tests",
            value: flakyTestsCount,
            description: "Inconsistent outcomes",
            icon: AlertTriangle,
            gradient: "from-amber-500/20 to-orange-500/20",
            iconColor: "text-amber-500",
            bgGlow: "bg-amber-500/10"
        },
    ];

    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Stat Cards */}
            {statCards.map((stat, index) => (
                <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                    <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card/80 to-muted/30 backdrop-blur-sm transition-all hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30">
                        {/* Background Glow */}
                        <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full ${stat.bgGlow} blur-3xl opacity-20`} />

                        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                                {stat.title}
                            </CardTitle>
                            <div className={`rounded-xl bg-gradient-to-br ${stat.gradient} p-2.5 shadow-lg`}>
                                <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
                            </div>
                        </CardHeader>
                        <CardContent className="relative">
                            <div className="text-3xl font-black tabular-nums tracking-tight">
                                {stat.value}
                            </div>
                            <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}

            {/* Overall Test Status - Pie Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="col-span-full lg:col-span-2"
            >
                <Card className="group relative overflow-hidden border-border/40 bg-gradient-to-br from-card/95 via-card/90 to-muted/40 backdrop-blur-xl shadow-2xl transition-all duration-500 hover:shadow-primary/10 hover:border-primary/40">
                    {/* Enhanced Decorative Elements */}
                    <div className="absolute -right-12 -top-12 h-56 w-56 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-3xl rounded-full opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                    <div className="absolute right-20 top-20 h-32 w-32 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 blur-2xl rounded-full" />

                    <CardHeader className="relative pb-2">
                        <div className="flex items-center gap-3">
                            <div className="relative rounded-2xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 p-3 shadow-xl backdrop-blur-sm border border-blue-500/20">
                                <Activity className="h-6 w-6 text-blue-400" />
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-xl" />
                            </div>
                            <div className="flex-1">
                                <CardTitle className="text-xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                                    Overall Test Status
                                </CardTitle>
                                <CardDescription className="text-xs font-bold mt-0.5 text-muted-foreground/80">
                                    Aggregated results from <span className="text-primary font-black">{overallSummary.totalRuns}</span> execution{overallSummary.totalRuns !== 1 ? 's' : ''}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="relative pt-6 pb-8">
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                            {/* Pie Chart */}
                            <div className="relative flex-1 flex items-center justify-center">
                                <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[220px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <defs>
                                                <filter id="glow">
                                                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                                    <feMerge>
                                                        <feMergeNode in="coloredBlur" />
                                                        <feMergeNode in="SourceGraphic" />
                                                    </feMerge>
                                                </filter>
                                            </defs>
                                            <ChartTooltip
                                                cursor={false}
                                                content={<ChartTooltipContent hideLabel />}
                                            />
                                            <Pie
                                                data={pieChartData}
                                                dataKey="value"
                                                nameKey="name"
                                                innerRadius="65%"
                                                outerRadius="90%"
                                                strokeWidth={3}
                                                stroke="hsl(var(--background))"
                                            >
                                                {pieChartData.map((entry) => (
                                                    <Cell
                                                        key={`cell-${entry.name}`}
                                                        fill={entry.fill}
                                                        className="transition-all duration-300 hover:opacity-80"
                                                    />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                                {/* Center Stats */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="text-center">
                                        <div className="text-4xl font-black tabular-nums bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
                                            {overallSummary.totalTests}
                                        </div>
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mt-1">
                                            Total Tests
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Custom Legend */}
                            <div className="flex flex-col gap-3 lg:min-w-[180px]">
                                {pieChartData.map((item, index) => (
                                    <motion.div
                                        key={item.name}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                                        className="flex items-center justify-between gap-4 rounded-xl bg-gradient-to-r from-muted/40 to-muted/20 backdrop-blur-sm px-4 py-2.5 border border-border/30 hover:border-border/60 transition-all duration-300 group/item"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="h-3 w-3 rounded-full shadow-lg ring-2 ring-background/50 transition-transform duration-300 group-hover/item:scale-110"
                                                style={{ backgroundColor: item.fill }}
                                            />
                                            <span className="text-xs font-bold capitalize text-foreground/90">
                                                {item.name}
                                            </span>
                                        </div>
                                        <span className="text-sm font-black tabular-nums text-foreground">
                                            {item.value}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Historical Trend - Bar Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="col-span-full lg:col-span-2"
            >
                <Card className="group relative overflow-hidden border-border/40 bg-gradient-to-br from-card/95 via-card/90 to-muted/40 backdrop-blur-xl shadow-2xl transition-all duration-500 hover:shadow-emerald-500/10 hover:border-emerald-500/40">
                    {/* Enhanced Decorative Elements */}
                    <div className="absolute -left-12 -top-12 h-56 w-56 bg-gradient-to-br from-emerald-500/10 via-green-500/10 to-teal-500/10 blur-3xl rounded-full opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                    <div className="absolute left-20 top-20 h-32 w-32 bg-gradient-to-br from-green-500/5 to-emerald-500/5 blur-2xl rounded-full" />

                    <CardHeader className="relative pb-2">
                        <div className="flex items-center gap-3">
                            <div className="relative rounded-2xl bg-gradient-to-br from-emerald-500/20 via-green-500/20 to-teal-500/20 p-3 shadow-xl backdrop-blur-sm border border-emerald-500/20">
                                <TrendingUp className="h-6 w-6 text-emerald-400" />
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 blur-xl" />
                            </div>
                            <div className="flex-1">
                                <CardTitle className="text-xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                                    Historical Trend
                                </CardTitle>
                                <CardDescription className="text-xs font-bold mt-0.5 text-muted-foreground/80">
                                    Test statuses for the last <span className="text-emerald-500 font-black">{historicalData.length}</span> execution{historicalData.length !== 1 ? 's' : ''}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="relative pt-6 pb-6">
                        <ChartContainer config={chartConfig} className="h-[240px] w-full">
                            <BarChart accessibilityLayer data={historicalData}>
                                <defs>
                                    <linearGradient id="passedGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                                        <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                                    </linearGradient>
                                    <linearGradient id="failedGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="hsl(var(--chart-3))" stopOpacity={0.8} />
                                        <stop offset="100%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3} />
                                    </linearGradient>
                                    <linearGradient id="skippedGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="hsl(var(--chart-4))" stopOpacity={0.8} />
                                        <stop offset="100%" stopColor="hsl(var(--chart-4))" stopOpacity={0.3} />
                                    </linearGradient>
                                    <linearGradient id="interruptedGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="hsl(var(--chart-5))" stopOpacity={0.8} />
                                        <stop offset="100%" stopColor="hsl(var(--chart-5))" stopOpacity={0.3} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    vertical={false}
                                    strokeDasharray="3 3"
                                    opacity={0.15}
                                    stroke="hsl(var(--muted-foreground))"
                                />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                    tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }}
                                />
                                <ChartTooltip
                                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
                                    content={<ChartTooltipContent indicator="dot" />}
                                />
                                <ChartLegend
                                    content={<ChartLegendContent />}
                                    wrapperStyle={{ paddingTop: '20px' }}
                                />
                                <Bar
                                    dataKey="passed"
                                    stackId="a"
                                    fill="url(#passedGradient)"
                                    radius={[0, 0, 0, 0]}
                                    className="transition-all duration-300 hover:opacity-80"
                                />
                                <Bar
                                    dataKey="failed"
                                    stackId="a"
                                    fill="url(#failedGradient)"
                                    radius={[0, 0, 0, 0]}
                                    className="transition-all duration-300 hover:opacity-80"
                                />
                                <Bar
                                    dataKey="skipped"
                                    stackId="a"
                                    fill="url(#skippedGradient)"
                                    radius={[0, 0, 0, 0]}
                                    className="transition-all duration-300 hover:opacity-80"
                                />
                                <Bar
                                    dataKey="interrupted"
                                    stackId="a"
                                    fill="url(#interruptedGradient)"
                                    radius={[6, 6, 0, 0]}
                                    className="transition-all duration-300 hover:opacity-80"
                                />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
