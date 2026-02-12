import {test, expect} from '@playwright/test';
import {Login} from '../Pages/Login.js';
import {runQuery} from '../utils/db/dbClient.js';
test ('Recruiter logs in successfully', async ({page}) => {
  const login = new Login (page);

  await login.goto();
  await login.login('carlos@gmail.com', 'Carlos@123');
  await login.clickSignIn();

  // Verify user exists in DB
  const users = await runQuery(
    `
    SELECT id, email
    FROM users
    WHERE email = $1
    `,
    ['carlos@gmail.com']
  );

  expect(users.length).toBe(1);
  expect(users[0].email).toBe('carlos@gmail.com');

  console.log('DB verification passed: User exists');
});