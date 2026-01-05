import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Test, TestRun } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getTestRunSummary = (run: TestRun) => {
  const summary = {
    passed: 0,
    failed: 0,
    skipped: 0,
    interrupted: 0,
    total: run.tests.length,
  };
  for (const test of run.tests) {
    if (test.status === "passed") summary.passed++;
    else if (test.status === "failed" || test.status === "timedOut") summary.failed++;
    else if (test.status === "skipped") summary.skipped++;
    else if (test.status === "interrupted") summary.interrupted++;
  }
  return summary;
};

export const getFlakyTests = (runs: TestRun[]): Set<string> => {
  const testHistory: Record<string, Set<Test['status']>> = {};

  for (const run of runs) {
    for (const test of run.tests) {
      if (!testHistory[test.name]) {
        testHistory[test.name] = new Set();
      }
      testHistory[test.name].add(test.status);
    }
  }

  const flakyTestIds = new Set<string>();
  for (const testName in testHistory) {
    const statuses = testHistory[testName];
    if (statuses.has('passed') && statuses.has('failed')) {
      flakyTestIds.add(testName);
    }
  }

  return flakyTestIds;
}
