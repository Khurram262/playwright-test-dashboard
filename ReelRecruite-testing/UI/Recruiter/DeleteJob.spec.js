import { test, } from '@playwright/test';
import { Login } from '../../Pages/Login.js';
import { deleteJobPage } from '../../Pages/DeleteJob.js';
import { verifyJobDeleted } from '../../support/jobDb.helper.js';
import { loadCredentials } from '../../support/recruiterCredentials.js';
import { getLatestJobId, buildJobUrl } from '../../support/job.helper.js';

const recruiter = loadCredentials()[0];
const jobId = getLatestJobId();
const jobUrl = buildJobUrl(jobId);


test('Recruiter delete job', async ({ page }) => {
 
  const loginPage = new Login(page);
  await loginPage.goto();
  await loginPage.login(recruiter.email, recruiter.password);
  await loginPage.clickSignIn();
  await page.waitForURL('**/my-jobs');

  await page.goto(jobUrl);

  const deleteJob = new deleteJobPage(page);
  await deleteJob.deleteJob();
  await deleteJob.confirmDelete();

  // Verify Db
  await verifyJobDeleted(jobId);

});
