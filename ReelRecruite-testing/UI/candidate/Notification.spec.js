import { test } from '@playwright/test';
import { loadCredentials } from '../../support/candidateCredentials.js';
import { Login } from '../../Pages/Login.js';
import { NotificationPage } from '../../Pages/Notification.js';

const candidate = loadCredentials()[0];

test('Notification flow – handle empty & existing notifications', async ({
  page,
}) => {
  const login = new Login(page);
  const notification = new NotificationPage(page);

  await login.goto();
  await login.login(candidate.email, candidate.password);
  await login.clickSignIn();
  await page.waitForURL('**/jobs');

  await notification.handleNotificationsFlow();
});
