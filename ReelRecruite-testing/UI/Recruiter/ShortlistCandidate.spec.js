import { test } from '@playwright/test';
import { loadCredentials } from '../../support/recruiterCredentials.js';
import { getLatestJobId, buildJobUrl } from '../../support/job.helper.js';
import { Login } from '../../Pages/Login.js';
import { ShortlistCandidatePage } from '../../Pages/ShortListCandidate.js';

const recruiter = loadCredentials()[0];
const jobId = getLatestJobId();
const jobUrl = buildJobUrl(jobId);

test('Recruiter shortlists candidate from Applications', async ({ page }) => {
  const loginPage = new Login(page);
  await loginPage.goto();
  await loginPage.login(recruiter.email, recruiter.password);
  await loginPage.clickSignIn();
  await page.waitForURL('**/my-jobs');


  await page.goto(jobUrl, { waitUntil: 'domcontentloaded' });

  const shortlistPage = new ShortlistCandidatePage(page);
  await shortlistPage.clickViewApplications();
  await shortlistPage.clickViewDetails();
  await shortlistPage.updateStatus();
  await shortlistPage.clickShortListed();
  await shortlistPage.clickSave();
});
