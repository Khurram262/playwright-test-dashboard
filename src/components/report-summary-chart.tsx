"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { getTestRunSummary } from "@/lib/utils";
import type { TestRun } from "@/types";
import { Pie, PieChart, Cell } from "recharts";
import { CheckCircle2, MinusCircle, Package, XCircle, AlertCircle } from "lucide-react";

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

  return (
    <Card className="print-break-inside-avoid">
      <CardHeader>
        <CardTitle>Run Summary</CardTitle>
        <CardDescription>
          Total execution duration: {(totalDuration / 1000).toFixed(2)}s | Executed on: {new Date(run.executionDate).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex items-center justify-center lg:col-span-1">
            <ChartContainer config={chartConfig} className="min-h-[180px] w-full max-w-[250px]">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} strokeWidth={2}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:col-span-2">
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.total}</div>
              </CardContent>
            </Card>
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
            {summary.interrupted > 0 && (
                 <Card className="border-gray-500/50 bg-gray-500/5">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Interrupted</CardTitle>
                    <AlertCircle className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{summary.interrupted}</div>
                  </CardContent>
                </Card>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-center">
         <ChartLegend content={<ChartLegendContent />} />
      </CardFooter>
    </Card>
  );
}
