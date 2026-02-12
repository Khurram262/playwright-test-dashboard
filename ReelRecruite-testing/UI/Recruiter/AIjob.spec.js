import { test, expect } from '@playwright/test';
import { Login } from '../../Pages/Login.js';
import { CreateJobPage } from '../../Pages/CreateJobPage.js';
import { verifyJobInDb } from '../../support/jobDb.helper.js';
import { storeJobId } from '../../support/job.helper.js';
import { loadCredentials } from '../../support/recruiterCredentials.js';

const recruiter = loadCredentials()[0];

test('Recruiter login and create a new job with AI generation', async ({ page }) => {
  const loginPage = new Login(page);
  const createJob = new CreateJobPage(page);

  await loginPage.goto();
  await loginPage.login(recruiter.email, recruiter.password);
  await loginPage.clickSignIn();
  await page.waitForURL('**/my-jobs');

  await createJob.openJobForm();
  
  // Fill initial job details (Title, Summary with AI, Region, Location)
  await createJob.titleInput.fill('Software Quality Assurance Engineer');
  
  // Generate summary with AI using prompt
  await createJob.generateSummaryWithAI();
  await createJob.generateWithPrompt('Create a compelling job summary that attracts top talent for a Software QA Engineer position focusing on automation testing expertise');
  await createJob.applyGeneratedSummary();
  
  // Fill remaining initial details
  await createJob.regionInput.fill('South America');
  await createJob.locationInput.fill('Pakistan');
  await Promise.all([
    page.waitForLoadState('networkidle', { timeout: 30000 }),
    createJob.nextButton.click()
  ]);
  
  // Fill job type and compensation section
  await createJob.fillJobTypeAndCompensation();
  
  // Generate description with AI using prompt
  await createJob.generateDescriptionWithAI();
  await createJob.generateWithPrompt('Write a detailed job description for a Software QA Engineer role including responsibilities, test automation frameworks, and industry best practices');
  await createJob.applyGeneratedDescription();
  await Promise.all([
    page.waitForLoadState('networkidle', { timeout: 30000 }),
    createJob.nextButton.click()
  ]);
  
  await createJob.addSkills();
  await createJob.fillRequirements();
  await Promise.all([
    page.waitForLoadState('networkidle', { timeout: 30000 }),
    createJob.nextButton.click()
  ]);
  await createJob.addQuestions();
  await page.waitForLoadState('networkidle', { timeout: 60000 });
  await page.waitForTimeout(2000);
  await createJob.previewJob();
  
  // store JobId
  const jobId = await createJob.submitJob();
  expect(jobId).toBeTruthy();
  storeJobId(jobId);

  await createJob.seeAllApplications();
  await verifyJobInDb(jobId, recruiter.email);
});
