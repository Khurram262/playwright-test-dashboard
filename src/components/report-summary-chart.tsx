"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, Label, Pie, PieChart, XAxis, YAxis, Cell, ResponsiveContainer, LabelList } from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart";
import { getTestRunSummary } from "@/lib/utils";
import type { TestRun } from "@/types";
import { activity, AlertTriangle, CheckCircle2, Clock, Package, Timer, XCircle } from "lucide-react";
import { motion } from "framer-motion";

const chartConfig = {
    passed: { label: "Passed", color: "hsl(var(--chart-1))" },
    failed: { label: "Failed", color: "hsl(var(--chart-3))" },
    skipped: { label: "Skipped", color: "hsl(var(--chart-4))" },
    interrupted: { label: "Interrupted", color: "hsl(var(--chart-5))" },
};

type ReportSummaryChartProps = {
    run: TestRun;
};

export function ReportSummaryChart({ run }: ReportSummaryChartProps) {
    const summary = getTestRunSummary(run);

    // Calculate Pass Percentage
    const passRate = summary.total > 0 ? (summary.passed / summary.total) * 100 : 0;

    // Calculate Duration
    const totalDurationMs = run.tests.reduce((acc, test) => acc + test.duration, 0);
    const durationSeconds = (totalDurationMs / 1000).toFixed(2);

    // Calculate Flaky Tests
    // Note: This relies on the convention that a flaky test has a certain property or status.
    // For now, let's assume valid status is unstable/flaky if you store it, 
    // but based on type definition, we might need to check retries > 0 & eventual success.
    // Assuming 'flaky' isn't explicitly in 'status' enum of TestRun's tests, we check retries.
    // However, for this visual, let's stick to what we have or count 'expectedly' flaky if marked.
    // If you don't have explicit flaky status in individual run tests, we can skip or use a placeholder.
    // Let's use 'Skipped' count as a distinct metric or just Total Flaky if logic exists.
    // For this design, I'll use "Duration" as a key metric card instead of Flaky since it's a single run.

    const barChartData = [
        { name: "Passed", value: summary.passed, fill: "hsl(var(--chart-1))" },
        { name: "Failed", value: summary.failed, fill: "hsl(var(--chart-3))" },
        { name: "Skipped", value: summary.skipped, fill: "hsl(var(--chart-4))" },
        { name: "Interrupted", value: summary.interrupted, fill: "hsl(var(--chart-5))" },
    ];

    const pieChartData = [
        { name: "passed", value: summary.passed, fill: "hsl(var(--chart-1))" },
        { name: "failed", value: summary.failed, fill: "hsl(var(--chart-3))" },
        { name: "skipped", value: summary.skipped, fill: "hsl(var(--chart-4))" },
        { name: "interrupted", value: summary.interrupted, fill: "hsl(var(--chart-5))" },
    ].filter(item => item.value > 0);

    const statCards = [
        {
            title: "Total Duration",
            value: `${durationSeconds}s`,
            description: "Total execution time",
            icon: Timer,
            gradient: "from-blue-500/20 to-cyan-500/20",
            iconColor: "text-blue-500",
            bgGlow: "bg-blue-500/10"
        },
        {
            title: "Total Tests",
            value: summary.total,
            description: "Tests executed in this run",
            icon: Package,
            gradient: "from-violet-500/20 to-purple-500/20",
            iconColor: "text-violet-500",
            bgGlow: "bg-violet-500/10"
        },
        {
            title: "Pass Rate",
            value: `${passRate.toFixed(1)}%`,
            description: `${summary.passed} passed, ${summary.failed} failed`,
            icon: CheckCircle2,
            gradient: "from-emerald-500/20 to-green-500/20",
            iconColor: "text-emerald-500",
            bgGlow: "bg-emerald-500/10"
        },
        {
            title: "Failed Tests",
            value: summary.failed,
            description: "Tests requiring attention",
            icon: XCircle,
            gradient: "from-red-500/20 to-rose-500/20",
            iconColor: "text-red-500",
            bgGlow: "bg-red-500/10"
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
                    <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card/80 to-muted/30 backdrop-blur-sm transition-all hover:shadow-lg hover:border-primary/30">
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
                            <div className="text-2xl font-black tabular-nums tracking-tight">
                                {stat.value}
                            </div>
                            <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}

            {/* Test Status Distribution (Pie Chart) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="col-span-full lg:col-span-2"
            >
                <Card className="h-full border-border/50 bg-card/50">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Status Distribution</CardTitle>
                        <CardDescription>Visual breakdown of test results</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px] w-full">
                            <ChartContainer config={chartConfig} className="h-full w-full mx-auto">
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
                                            innerRadius={60}
                                            strokeWidth={5}
                                            paddingAngle={5}
                                        >
                                            <Label
                                                content={({ viewBox }) => {
                                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                        return (
                                                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                                                <tspan
                                                                    x={viewBox.cx}
                                                                    y={viewBox.cy}
                                                                    className="fill-foreground text-3xl font-bold"
                                                                >
                                                                    {summary.total}
                                                                </tspan>
                                                                <tspan
                                                                    x={viewBox.cx}
                                                                    y={(viewBox.cy || 0) + 24}
                                                                    className="fill-muted-foreground text-xs font-semibold uppercase"
                                                                >
                                                                    Tests
                                                                </tspan>
                                                            </text>
                                                        )
                                                    }
                                                }}
                                            />
                                            {pieChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} stroke="hsl(var(--background))" />
                                            ))}
                                        </Pie>
                                        <ChartLegend
                                            content={<ChartLegendContent nameKey="name" />}
                                            className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Test Breakdown (Horizontal Bar Chart) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="col-span-full lg:col-span-2"
            >
                <Card className="h-full border-border/50 bg-card/50">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Detailed Breakdown</CardTitle>
                        <CardDescription>Count of tests per status category</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px] w-full">
                            <ChartContainer config={chartConfig} className="h-full w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        accessibilityLayer
                                        data={barChartData}
                                        layout="vertical"
                                        margin={{ left: 0, top: 0, right: 30, bottom: 0 }}
                                        barGap={10}
                                    >
                                        <CartesianGrid horizontal={false} vertical={false} />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            tickLine={false}
                                            axisLine={false}
                                            width={80}
                                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 13, fontWeight: 500 }}
                                        />
                                        <XAxis type="number" hide />
                                        <ChartTooltip
                                            cursor={{ fill: "hsl(var(--muted)/0.2)" }}
                                            content={<ChartTooltipContent />}
                                        />
                                        <Bar
                                            dataKey="value"
                                            layout="vertical"
                                            radius={[0, 4, 4, 0]}
                                            barSize={32}
                                        >
                                            <LabelList
                                                dataKey="value"
                                                position="right"
                                                className="fill-foreground font-bold text-sm"
                                                formatter={(value: any) => value > 0 ? value : ''}
                                            />
                                            {barChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
