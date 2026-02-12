import { getRandomMessage } from '../../support/message.helper.js';
import { loadCredentials } from '../../support/recruiterCredentials.js';
import { test } from '@playwright/test';
import { SendMessagePage } from '../../Pages/SendMessagePage.js';
import { Login } from '../../Pages/Login.js';

const recruiter = loadCredentials()[0];

test('recruiter logs in and sends a message', async ({ page }) => {
  const loginPage = new Login(page);
  const sendMessagePage = new SendMessagePage(page);

  await loginPage.goto();
  await loginPage.login(recruiter.email, recruiter.password);
  await loginPage.clickSignIn();
  await page.waitForURL('**/my-jobs');
  
  await sendMessagePage.openMessages();
  await sendMessagePage.selectMessage();
  const message = getRandomMessage();
  await sendMessagePage.sendMessage(message);

});
