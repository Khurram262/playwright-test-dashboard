import { expect } from '@playwright/test';
import { runQuery } from '../utils/db/dbClient.js';

/**
 * Returns the application ID after verifying it exists in DB
 */
export async function getApplicationIdForCandidate(email, jobId) {
  const users = await runQuery(
    `SELECT id FROM users WHERE email = $1`,
    [email]
  );

  expect(users.length).toBe(1);
  const candidateId = users[0].id;

  const applications = await runQuery(
    `
    SELECT id
    FROM applications
    WHERE candidate_id = $1 AND job_id = $2
    `,
    [candidateId, jobId]
  );

  expect(applications.length).toBe(1);
  const applicationId = applications[0].id;

  const answers = await runQuery(
    `
    SELECT id
    FROM application_answers
    WHERE application_id = $1
    `,
    [applicationId]
  );

  expect(answers.length).toBeGreaterThan(0);
  console.log(`Application ID: ${applicationId}`);
  return applicationId;
}

export async function verifyApplicationWithdrawn(email, applicationId) {
  // Get candidate ID
  const users = await runQuery(
    `SELECT id FROM users WHERE email = $1`,
    [email]
  );

  expect(users.length).toBe(1);
  const candidateId = users[0].id;

  // Verify application exists and is withdrawn
  const applications = await runQuery(
    `
    SELECT id, status
    FROM applications
    WHERE id = $1
      AND candidate_id = $2
      AND status = 'withdrawn'
    `,
    [applicationId, candidateId]
  );

  expect(applications.length).toBe(1);
  console.log('DB verification passed: Application is withdrawn');
  return applications[0].id;
}
