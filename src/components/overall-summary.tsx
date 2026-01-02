
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
import { Briefcase, CheckCircle2, Clock, HelpCircle, Package, AlertCircle } from 'lucide-react';

const chartConfig = {
  passed: { label: 'Passed', color: 'hsl(var(--chart-1))' },
  failed: { label: 'Failed', color: 'hsl(var(--chart-3))' },
  skipped: { label: 'Skipped', color: 'hsl(var(--chart-4))' },
  interrupted: { label: 'Interrupted', color: 'hsl(var(--chart-5))' },
  total: { label: 'Total', color: 'hsl(var(--primary))' },
};

const PIE_COLORS = {
  passed: "var(--color-passed)",
  failed: "var(--color-failed)",
  skipped: "var(--color-skipped)",
  interrupted: "var(--color-interrupted)",
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
    { name: 'Passed', value: overallSummary.passed, fill: PIE_COLORS.passed },
    { name: 'Failed', value: overallSummary.failed, fill: PIE_COLORS.failed },
    { name: 'Skipped', value: overallSummary.skipped, fill: PIE_COLORS.skipped },
    { name: 'Interrupted', value: overallSummary.interrupted, fill: PIE_COLORS.interrupted },
  ].filter(d => d.value > 0);

  const historicalData = React.useMemo(() => {
     return runs.map(run => {
        const summary = getTestRunSummary(run);
        return {
            date: new Date(run.executionDate),
            ...summary
        }
     }).slice(0, 15).reverse();
  }, [runs]);


  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{overallSummary.totalRuns}</div>
                <p className="text-xs text-muted-foreground">Total number of test executions</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{overallSummary.totalTests}</div>
                <p className="text-xs text-muted-foreground">Across all test runs</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Pass Rate</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{overallSummary.passPercentage.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">{overallSummary.passed} passed out of {overallSummary.totalTests}</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Flaky Tests</CardTitle>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                 <div className="text-2xl font-bold">
                    {flakyTestsCount}
                </div>
                <p className="text-xs text-muted-foreground">Tests with inconsistent outcomes</p>
            </CardContent>
        </Card>

        <Card className="col-span-full lg:col-span-2">
            <CardHeader>
                <CardTitle>Overall Test Status</CardTitle>
                <CardDescription>Aggregated results from all {overallSummary.totalRuns} runs.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center pt-4">
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
                                className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
        
        <Card className="col-span-full lg:col-span-2">
            <CardHeader>
                <CardTitle>Historical Trend</CardTitle>
                <CardDescription>Test statuses for the last {historicalData.length} runs.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <BarChart accessibilityLayer data={historicalData}>
                         <CartesianGrid vertical={false} />
                         <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        />
                        <YAxis 
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" />}
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar dataKey="passed" stackId="a" fill="var(--color-passed)" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="failed" stackId="a" fill="var(--color-failed)" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="skipped" stackId="a" fill="var(--color-skipped)" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="interrupted" stackId="a" fill="var(--color-interrupted)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    </div>
  );
}
