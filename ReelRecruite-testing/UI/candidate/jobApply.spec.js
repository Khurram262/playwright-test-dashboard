import { test, chromium } from '@playwright/test';
import { Login } from '../../Pages/Login.js';
import { ApplyJobPage } from '../../Pages/ApplyJobPage.js';
import { loadCredentials } from '../../support/candidateCredentials.js';
import { getLatestJobId, buildJobUrl } from '../../support/job.helper.js';
import { storeApplicationId } from '../../support/application.helper.js';
import { getApplicationIdForCandidate } from '../../support/applicationDb.helper.js';

const users = loadCredentials().slice(0, 3);
const jobId = getLatestJobId();
const jobUrl = buildJobUrl(jobId);

test('Apply for latest job (users from JSON)', async () => {
  test.setTimeout(180000); 
  const browser = await chromium.launch({ headless: false });

  for (const user of users) {
    console.log(`\nProcessing user: ${user.email}`);
    const context = await browser.newContext({
      permissions: ['camera', 'microphone']
    });

    const page = await context.newPage();

    const loginPage = new Login(page);
    const applyJobPage = new ApplyJobPage(page);
    await loginPage.goto();
    await loginPage.login(user.email, user.password);
    await loginPage.clickSignIn();
    await page.waitForURL('**/jobs');

    await page.goto(jobUrl);
    await applyJobPage.applyNow();
    await applyJobPage.recordVideo();
    await page.waitForTimeout(10000);
    await applyJobPage.stopRecording();
    await applyJobPage.answerOne();
    await applyJobPage.answerTwo();
    await applyJobPage.submitApplication();

    const applicationId = await getApplicationIdForCandidate(user.email, jobId);


    storeApplicationId(applicationId);

    await context.close();
  }

  await browser.close();
});
