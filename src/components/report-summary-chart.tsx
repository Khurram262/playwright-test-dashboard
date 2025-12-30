"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, Label, RadialBar, RadialBarChart, XAxis, YAxis } from "recharts";
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
    const chartData = [
        { name: "Passed", value: summary.passed, fill: "var(--color-passed)" },
        { name: "Failed", value: summary.failed, fill: "var(--color-failed)" },
        { name: "Skipped", value: summary.skipped, fill: "var(--color-skipped)" },
        { name: "Interrupted", value: summary.interrupted, fill: "var(--color-interrupted)" },
    ];

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
                                        background={{ fill: 'hsl(var(--secondary))' }}
                                        dataKey="value"
                                        cornerRadius={12}
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
                                        margin={{ left: 10, top: 0, right: 10, bottom: 0 }}
                                    >
                                        <CartesianGrid horizontal={false} />
                                        <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                                        <XAxis type="number" hide />
                                        <ChartTooltip
                                            cursor={{ fill: "hsl(var(--accent))" }}
                                            content={<ChartTooltipContent />}
                                        />
                                        <Bar dataKey="value" layout="vertical" radius={5} barSize={32}>
                                        </Bar>
                                    </BarChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Passed</CardTitle>
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{summary.passed}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Failed</CardTitle>
                                    <XCircle className="h-4 w-4 text-red-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{summary.failed}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Skipped</CardTitle>
                                    <MinusCircle className="h-4 w-4 text-yellow-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{summary.skipped}</div>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Interrupted</CardTitle>
                                    <AlertCircle className="h-4 w-4 text-gray-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{summary.interrupted}</div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
