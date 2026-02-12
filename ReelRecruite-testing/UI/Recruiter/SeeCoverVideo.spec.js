import {test} from '@playwright/test';
import  {loadCredentials} from '../../support/recruiterCredentials.js';
import {getLatestJobId, buildJobUrl} from '../../support/job.helper.js';
import {Login} from '../../Pages/Login.js';
import {SeeCoverVideoPage} from '../../Pages/SeeCoverVideo.js';


const recruiter = loadCredentials()[0];
const jobId = getLatestJobId();
const jobUrl = buildJobUrl(jobId);

test('Recruiter see cover video', async ({ page }) => {
  const loginPage = new Login(page);
  const seeCoverVideo = new SeeCoverVideoPage(page);

  await loginPage.goto();
  await loginPage.login(recruiter.email, recruiter.password);
  await loginPage.clickSignIn(); 
  await page.waitForURL('**/my-jobs');

  await page.goto(jobUrl);

  await seeCoverVideo.navigateToApplications();
  await seeCoverVideo.viewCandidateDetails();
  await seeCoverVideo.viewCandidateProfile();
  await seeCoverVideo.navigateToCoverVideoSection();
  await seeCoverVideo.playVideo();
  await seeCoverVideo.isVideoPlaying();
});