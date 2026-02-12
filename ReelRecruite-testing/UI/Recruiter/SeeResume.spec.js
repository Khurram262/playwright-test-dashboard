import {test} from '@playwright/test';
import { loadCredentials } from '../../support/recruiterCredentials.js';
import { getLatestJobId, buildJobUrl } from '../../support/job.helper.js';
import {Login} from '../../Pages/Login.js';
import {SeeResumePage} from '../../Pages/SeeResume.js';

const recruiter = loadCredentials()[0];
const jobId = getLatestJobId();
const jobUrl = buildJobUrl(jobId);

test('Recruiter see Resume', async ({ page }) => {
  const loginPage = new Login(page);
  const seeResume= new SeeResumePage(page);

  await loginPage.goto();
  await loginPage.login(recruiter.email, recruiter.password);
  await loginPage.clickSignIn();

  await page.goto(jobUrl);

  await seeResume.navigateToApplications();
  await seeResume.viewCandidateDetails();
  await seeResume.viewCandidateProfile();
  await seeResume.navigateToResumeSection();
  await seeResume.clickViewResume();
});