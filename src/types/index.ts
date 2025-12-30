// This file is no longer needed with the built-in HTML reporter but is kept for future reference.
export type TestStatus = 'passed' | 'failed' | 'skipped' | 'interrupted' | 'timedOut';

export interface TestAttachment {
  type: 'screenshot' | 'video';
  path: string;
  description: string;
}

export interface Test {
  id: string;
  name: string;
  description: string;
  duration: number; // in milliseconds
  status: TestStatus;
  error?: string;
  errorLog?: string;
  attachments?: TestAttachment[];
}

export interface TestRun {
  runId: string;
  executionDate: string; // ISO string
  tests: Test[];
}
