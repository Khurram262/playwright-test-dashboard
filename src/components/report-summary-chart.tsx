"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { getTestRunSummary } from "@/lib/utils";
import type { TestRun } from "@/types";
import { Pie, PieChart, Cell } from "recharts";
import { CheckCircle2, MinusCircle, Package, XCircle } from "lucide-react";

type ReportSummaryChartProps = {
  run: TestRun;
};

const chartConfig = {
  passed: { label: "Passed", color: "hsl(var(--chart-2))" },
  failed: { label: "Failed", color: "hsl(var(--chart-3))" },
  skipped: { label: "Skipped", color: "hsl(var(--chart-4))" },
};

export function ReportSummaryChart({ run }: ReportSummaryChartProps) {
  const summary = getTestRunSummary(run);
  const chartData = [
    { name: "passed", value: summary.passed, fill: chartConfig.passed.color },
    { name: "failed", value: summary.failed, fill: chartConfig.failed.color },
    { name: "skipped", value: summary.skipped, fill: chartConfig.skipped.color },
  ].filter(d => d.value > 0);
  
  const totalDuration = run.tests.reduce((acc, test) => acc + test.duration, 0);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Run Summary</CardTitle>
        <CardDescription>
          Total execution duration: {(totalDuration / 1000).toFixed(2)}s
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.total}</div>
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Passed</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{summary.passed}</div>
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">{summary.failed}</div>
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Skipped</CardTitle>
                <MinusCircle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-500">{summary.skipped}</div>
              </CardContent>
            </Card>
          </div>
          <div className="flex items-center justify-center">
            <ChartContainer config={chartConfig} className="min-h-[150px] w-full max-w-[200px]">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={60} strokeWidth={2}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
