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
                <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card/80 to-muted/30 backdrop-blur-sm">
                    {/* Decorative Elements */}
                    <div className="absolute right-0 top-0 h-40 w-40 bg-primary/5 blur-3xl rounded-full" />

                    <CardHeader className="relative">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 p-2.5 shadow-lg">
                                <Activity className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-black tracking-tight">Overall Test Status</CardTitle>
                                <CardDescription className="text-xs font-semibold">
                                    Aggregated results from {overallSummary.totalRuns} execution{overallSummary.totalRuns !== 1 ? 's' : ''}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="relative flex items-center justify-center pt-4">
                        <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent hideLabel />}
                                    />
                                    <Pie
                                        data={pieChartData}
                                        dataKey="value"
                                        nameKey="name"
                                        innerRadius="60%"
                                        strokeWidth={5}
                                    >
                                        {pieChartData.map((entry) => (
                                            <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <ChartLegend
                                        content={<ChartLegendContent nameKey="name" />}
                                        className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-auto [&>*]:gap-1"
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
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
                <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card/80 to-muted/30 backdrop-blur-sm">
                    {/* Decorative Elements */}
                    <div className="absolute left-0 top-0 h-40 w-40 bg-emerald-500/5 blur-3xl rounded-full" />

                    <CardHeader className="relative">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 p-2.5 shadow-lg">
                                <TrendingUp className="h-5 w-5 text-emerald-500" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-black tracking-tight">Historical Trend</CardTitle>
                                <CardDescription className="text-xs font-semibold">
                                    Test statuses for the last {historicalData.length} execution{historicalData.length !== 1 ? 's' : ''}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="relative">
                        <ChartContainer config={chartConfig} className="h-[250px] w-full">
                            <BarChart accessibilityLayer data={historicalData}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 600 }}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 600 }}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent indicator="dot" />}
                                />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Bar dataKey="passed" stackId="a" fill="hsl(var(--chart-1))" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="failed" stackId="a" fill="hsl(var(--chart-3))" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="skipped" stackId="a" fill="hsl(var(--chart-4))" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="interrupted" stackId="a" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
