import { test, expect } from '@playwright/test';
import { loadCredentials } from '../../support/candidateCredentials.js';
import { Login } from '../../Pages/Login.js';
import { SearchJob } from '../../Pages/SearchJob.js';

const candidate = loadCredentials()[0];

test('Search job by name and verify results', async ({ page }) => {
  const loginPage = new Login(page);
  const searchPage = new SearchJob(page);
  await loginPage.goto();
  await loginPage.login(candidate.email, candidate.password);
  await loginPage.clickSignIn();
  await page.waitForURL('**/jobs');

  const keywords = ['software','react'];

  for (const keyword of keywords) {
    await searchPage.searchJob(keyword);
  }
});
