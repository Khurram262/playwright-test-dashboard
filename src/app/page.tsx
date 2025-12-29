import Link from "next/link";
import { testRuns } from "@/lib/test-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getTestRunSummary } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const runs = testRuns.sort((a, b) => new Date(b.executionDate).getTime() - new Date(a.executionDate).getTime());

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <main className="max-w-7xl mx-auto">
        <header className="flex items-center gap-4 mb-8">
          <Logo className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-2xl font-bold font-headline text-foreground">
              Playwright Report Exporter
            </h1>
            <p className="text-muted-foreground">
              Dashboard for test execution results.
            </p>
          </div>
        </header>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Test Runs</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Run ID</TableHead>
                  <TableHead className="hidden md:table-cell">Execution Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Passed</TableHead>
                  <TableHead>Failed</TableHead>
                  <TableHead>Skipped</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.map((run) => {
                  const summary = getTestRunSummary(run);
                  return (
                    <TableRow key={run.runId}>
                      <TableCell className="font-medium">{run.runId}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {new Date(run.executionDate).toLocaleString()}
                      </TableCell>
                      <TableCell>{summary.total}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {summary.passed}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          {summary.failed}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          {summary.skipped}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/run/${run.runId}`}>
                            View Report <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
