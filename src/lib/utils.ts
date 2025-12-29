import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { TestRun } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTestRunSummary(run: TestRun) {
  const total = run.tests.length;
  const passed = run.tests.filter((t) => t.status === "passed").length;
  const failed = run.tests.filter((t) => t.status === "failed").length;
  const skipped = run.tests.filter((t) => t.status === "skipped").length;
  return { total, passed, failed, skipped };
}
