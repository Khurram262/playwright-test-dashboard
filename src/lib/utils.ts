import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { TestRun } from "@/types";

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
    else if (test.status === "failed") summary.failed++;
    else if (test.status === "skipped") summary.skipped++;
    else if (test.status === "interrupted") summary.interrupted++;
  }
  return summary;
};
