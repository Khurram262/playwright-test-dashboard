export type TestStatus = 'passed' | 'failed' | 'skipped';

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
