import { expect } from '@playwright/test';
import { runQuery } from '../utils/db/dbClient.js';

export async function verifyUserCreated(email) {
  const users = await runQuery(
    `
    SELECT id, email
    FROM users
    WHERE email = $1
    `,
    [email]
  );

  expect(users.length).toBe(1);
  expect(users[0].email).toBe(email);

  return users[0].id;
}
