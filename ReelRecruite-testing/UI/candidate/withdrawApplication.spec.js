import { test } from '@playwright/test';
import { Login } from '../../Pages/Login.js';
import { withdrawPage } from '../../Pages/withdrawApplication.js';
import { loadCredentials } from '../../support/candidateCredentials.js';
import { getApplicationId, buildApplicationUrl } from '../../support/application.helper.js';
import { verifyApplicationWithdrawn } from '../../support/applicationDb.helper.js';

const candidate = loadCredentials()[0];
const applicationId = getApplicationId();

test('Candidate withdraw application', async ({ page }) => {
  const loginPage = new Login(page);
  const withdrawApplication = new withdrawPage(page);

  await loginPage.goto();
  await loginPage.login(candidate.email, candidate.password);
  await loginPage.clickSignIn();
  await page.waitForURL('**/jobs');

  const applicationUrl = buildApplicationUrl(applicationId);
  await page.goto(applicationUrl);
  await withdrawApplication.withdraw();
  await withdrawApplication.confirmWithdraw();

  // DB verification
  const verifiedApplicationId = await verifyApplicationWithdrawn(candidate.email, applicationId);
});
