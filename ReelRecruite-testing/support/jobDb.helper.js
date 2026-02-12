import { expect } from '@playwright/test';
import { runQuery } from '../utils/db/dbClient.js';

export async function verifyJobInDb(jobId, recruiterEmail) {
  const jobs = await runQuery(
    `
    SELECT j.id, j.title, j.recruiter_id, u.email
    FROM jobs j
    JOIN users u ON u.id = j.recruiter_id
    WHERE j.id = $1
    `,
    [jobId]
  );

  expect(jobs.length).toBe(1);
  expect(jobs[0].id).toBe(jobId);
  expect(jobs[0].email).toBe(recruiterEmail);
  console.log('DB verification passed: Job is in the database');
  return jobs[0].id;
  
}


export async function verifyJobDeleted(jobId) {
  const jobs = await runQuery(
    `
    SELECT id, "is_deleted"
    FROM jobs
    WHERE id = $1
    `,
    [jobId]
  );

  expect(jobs.length).toBe(1);
  expect(jobs[0].is_deleted).toBe(true);

  console.log('DB verification passed: Job is soft-deleted');
}