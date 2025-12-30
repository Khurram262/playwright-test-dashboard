// Defines the possible statuses for a test.
export type TestStatus = 'passed' | 'failed' | 'skipped' | 'interrupted' | 'timedOut';

// Represents an attachment for a test, like a screenshot or video.
export interface TestAttachment {
  type: 'screenshot' | 'video';
  path: string;
  description: string;
}

// Represents a single test within a test run.
export interface Test {
  id: string;
  name: string;
  description: string;
  duration: number; // in milliseconds
  status: TestStatus;
  error?: string | null;
  errorLog?: string | null;
  attachments?: TestAttachment[];
}

// Represents a full test run, containing multiple tests.
export interface TestRun {
  runId: string;
  executionDate: string; // ISO string format
  tests: Test[];
}
