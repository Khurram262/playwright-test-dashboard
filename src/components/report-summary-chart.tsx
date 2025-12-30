"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, Label, RadialBar, RadialBarChart, XAxis } from "recharts";
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
} from "@/components/ui/chart";
import { getTestRunSummary } from "@/lib/utils";
import type { TestRun } from "@/types";
import { AlertCircle, CheckCircle2, MinusCircle, Package, XCircle } from "lucide-react";

const chartConfig = {
    passed: { label: "Passed", color: "hsl(var(--chart-2))" },
    failed: { label: "Failed", color: "hsl(var(--chart-3))" },
    skipped: { label: "Skipped", color: "hsl(var(--chart-4))" },
    interrupted: { label: "Interrupted", color: "hsl(var(--chart-5))" },
};

type ReportSummaryChartProps = {
    run: TestRun;
};

export function ReportSummaryChart({ run }: ReportSummaryChartProps) {
    const summary = getTestRunSummary(run);
    const chartData = [
        { name: "passed", value: summary.passed, fill: "var(--color-passed)" },
        { name: "failed", value: summary.failed, fill: "var(--color-failed)" },
        { name: "skipped", value: summary.skipped, fill: "var(--color-skipped)" },
        { name: "interrupted", value: summary.interrupted, fill: "var(--color-interrupted)" },
    ].filter(d => d.value > 0);

    const totalDuration = run.tests.reduce((acc, test) => acc + test.duration, 0);
    const passPercentage = summary.total > 0 ? (summary.passed / summary.total) * 100 : 0;

    return (
        <Card className="print-break-inside-avoid">
            <CardHeader>
                <CardTitle>Run Summary</CardTitle>
                <CardDescription>
                    Total execution duration: {(totalDuration / 1000).toFixed(2)}s | Executed on: {new Date(run.executionDate).toLocaleString()}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    {/* First Column: Radial Chart & Total Tests */}
                    <div className="md:col-span-2 flex flex-col gap-6">
                        <Card className="flex flex-col items-center justify-center p-4 h-full">
                            <ChartContainer
                                config={chartConfig}
                                className="mx-auto aspect-square w-full max-w-[250px]"
                            >
                                <RadialBarChart
                                    data={[{ name: "passed", value: passPercentage, fill: "var(--color-passed)" }]}
                                    startAngle={90}
                                    endAngle={-270}
                                    innerRadius="70%"
                                    outerRadius="100%"
                                    barSize={24}
                                >
                                    <RadialBar
                                        background
                                        dataKey="value"
                                        className="fill-primary"
                                    />
                                    <Label 
                                      content={({ viewBox }) => {
                                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                            return (
                                                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={(viewBox.cy || 0) - 10}
                                                        className="fill-foreground text-4xl font-bold"
                                                    >
                                                        {passPercentage.toFixed(0)}%
                                                    </tspan>
                                                     <tspan
                                                        x={viewBox.cx}
                                                        y={(viewBox.cy || 0) + 15}
                                                        className="fill-muted-foreground text-base"
                                                    >
                                                        Passed
                                                    </tspan>
                                                </text>
                                            )
                                        }
                                      }}
                                    />
                                </RadialBarChart>
                            </ChartContainer>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
                                <Package className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.total}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Second Column: Bar Chart and Stats */}
                    <div className="md:col-span-3 flex flex-col">
                        <Card className="flex-1">
                            <CardHeader>
                                <CardTitle>Test Breakdown</CardTitle>
                                <CardDescription>A summary of test results by status.</CardDescription>
                            </CardHeader>
                            <CardContent className="pl-2">
                                 <ChartContainer config={chartConfig} className="h-[200px] w-full">
                                    <BarChart
                                        accessibilityLayer
                                        data={chartData}
                                        layout="vertical"
                                        margin={{ left: 0, top: 0, right: 40, bottom: 0 }}
                                    >
                                        <CartesianGrid horizontal={false} />
                                        <XAxis type="number" hide />
                                        <ChartTooltip
                                            cursor={{ fill: "hsl(var(--accent) / 0.1)" }}
                                            content={<ChartTooltipContent />}
                                        />
                                        <Bar dataKey="value" layout="vertical" radius={5} barSize={32}>
                                            <Label
                                                position="right"
                                                offset={10}
                                                className="fill-foreground font-medium"
                                                fontSize={14}
                                                formatter={(value: number, props: any) => {
                                                    const { payload } = props;
                                                    const label = chartConfig[payload.name as keyof typeof chartConfig]?.label;
                                                    return `${label}: ${value}`;
                                                }}
                                            />
                                        </Bar>
                                    </BarChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <Card className="border-green-500/50 bg-green-500/5">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Passed</CardTitle>
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{summary.passed}</div>
                                </CardContent>
                            </Card>
                            <Card className="border-red-500/50 bg-red-500/5">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Failed</CardTitle>
                                    <XCircle className="h-4 w-4 text-red-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">{summary.failed}</div>
                                </CardContent>
                            </Card>
                            <Card className="border-yellow-500/50 bg-yellow-500/5">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Skipped</CardTitle>
                                    <MinusCircle className="h-4 w-4 text-yellow-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{summary.skipped}</div>
                                </CardContent>
                            </Card>
                             <Card className="border-gray-500/50 bg-gray-500/5">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Interrupted</CardTitle>
                                    <AlertCircle className="h-4 w-4 text-gray-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{summary.interrupted}</div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

    