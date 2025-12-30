'use client';

import { Logo } from "@/components/screens/logo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal } from "lucide-react";

export default function Home() {

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <main className="max-w-4xl mx-auto">
        <header className="flex items-center gap-4 mb-8">
          <Logo className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-2xl font-bold font-headline text-foreground">
              Playwright Test Runner
            </h1>
            <p className="text-muted-foreground">
              A project ready to run your Playwright tests and view reports.
            </p>
          </div>
        </header>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-semibold">Run your tests</h3>
              <p className="text-muted-foreground">
                Execute all your end-to-end tests using the following npm script. This will start the application, run all tests in the `e2e` directory, and then automatically open a browser window with the test report if any tests fail.
              </p>
              <pre className="bg-muted p-4 rounded-lg text-sm font-mono text-foreground flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                <span>npm run test:e2e</span>
              </pre>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">How it works</h3>
              <p className="text-muted-foreground">
                This project is configured to use Playwright's built-in HTML reporter. The configuration can be found in `playwright.config.ts`. By default, it's set to launch the report automatically if any test fails. You can change `open: 'on-failure'` to `open: 'always'` to have it open after every single run.
              </p>
            </div>
             <div className="space-y-2">
              <h3 className="font-semibold">Viewing past reports</h3>
              <p className="text-muted-foreground">
                If you want to view the report from the last run at any time, you can use this command:
              </p>
              <pre className="bg-muted p-4 rounded-lg text-sm font-mono text-foreground flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                <span>npx playwright show-report</span>
              </pre>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
