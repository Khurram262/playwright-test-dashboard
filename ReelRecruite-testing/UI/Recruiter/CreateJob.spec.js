import { test, expect } from '@playwright/test';
import { Login } from '../../Pages/Login.js';
import { CreateJobPage } from '../../Pages/CreateJobPage.js';
import { verifyJobInDb } from '../../support/jobDb.helper.js';
import { storeJobId } from '../../support/job.helper.js';
import { loadCredentials } from '../../support/recruiterCredentials.js';

const recruiter = loadCredentials()[0];

test('Recruiter login and create a new job', async ({ page }) => {
  const loginPage = new Login(page);
  const createJob = new CreateJobPage(page);

  await loginPage.goto();
  await loginPage.login(recruiter.email, recruiter.password);
  await loginPage.clickSignIn();
  await page.waitForURL('**/my-jobs');

  await createJob.openJobForm();
  await createJob.fillTitle('React Developer');
  await createJob.generateHighlight();
  await createJob.addRegionAndLocation('asia','pakistan');
  await createJob.fillJobTypeAndCompensation();
  await createJob.fillJobDescription();
  await createJob.clickNext();
  await createJob.addQuestions();
  await createJob.previewJob();
  
  // store JobId
  const jobId = await createJob.submitJob();
  expect(jobId).toBeTruthy();
  storeJobId(jobId);

  
  await createJob.seeAllApplications();
  await verifyJobInDb(jobId, recruiter.email);
});
