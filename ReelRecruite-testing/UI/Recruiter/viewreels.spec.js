import { test } from '@playwright/test';
import { loadCredentials } from '../../support/recruiterCredentials.js';
import { getLatestJobId, buildJobUrl } from '../../support/job.helper.js';
import { Login } from '../../Pages/Login.js';
import { ViewReelsPage } from '../../Pages/ViewReels.js';

const recruiter = loadCredentials()[0];
const jobId = getLatestJobId();
const jobUrl = buildJobUrl(jobId);

test('Recruiter can view reels and scroll', async ({ page }) => {
    const loginPage = new Login(page);
    await loginPage.goto();
    await loginPage.login(recruiter.email, recruiter.password);
    await loginPage.clickSignIn();
    await page.waitForURL('**/my-jobs');

    await page.goto(jobUrl, { waitUntil: 'domcontentloaded' });
    const viewReelsPage = new ViewReelsPage(page);
    await viewReelsPage.navigateToViewReels();
    await viewReelsPage.scrollToReel(viewReelsPage.scrollLocator);

});
