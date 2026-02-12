import { test, expect } from '@playwright/test';
import { Login } from '../../Pages/Login.js';
import { loadCredentials } from '../../support/candidateCredentials.js';
import {UpdateCoverVideoResumePage} from '../../Pages/UploadCoverVideo.js';
import { getCandidateProfileByEmail, getCandidateCoverVideo } from '../../support/candidateDb.helper.js';


const candidate = loadCredentials()[0];

  test('candidate can upload a video resume', async ({ page }) => {
  test.setTimeout(120000);
  const loginPage = new Login(page);
  const coverVideoPage = new UpdateCoverVideoResumePage(page);
  await loginPage.goto();
  await loginPage.login(candidate.email, candidate.password);
  await loginPage.clickSignIn();
  await page.waitForURL('**/jobs');

  await coverVideoPage.clickProfile();
  await coverVideoPage.openProfile();
  await coverVideoPage.navigateToCoverVideoSection();
  await coverVideoPage.removeVideoIfExists();
  await coverVideoPage.uploadVideo();
  
  // Verify DB
  const profile = await getCandidateProfileByEmail(candidate.email);
  expect(profile).toBeTruthy();
 
  const coverVideo = await getCandidateCoverVideo(profile.user_id);
  expect(coverVideo).toBeTruthy();

});


