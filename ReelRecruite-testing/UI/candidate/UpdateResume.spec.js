import { test, expect } from '@playwright/test';
import { loadCredentials } from '../../support/candidateCredentials.js';
import { Login } from '../../Pages/Login.js';
import { UploadResume } from '../../Pages/ChangeResume.js';
import { getCandidateProfileByEmail, getCandidateResumeUrl } from '../../support/candidateDb.helper.js';


const candidate = loadCredentials()[0];

test('Candidate deletes and uploads resume', async ({ page }) => {
  const loginPage = new Login(page);
  const uploadResumePage = new UploadResume(page);

  await loginPage.goto();
  await loginPage.login(candidate.email, candidate.password);
  await loginPage.clickSignIn();
  await page.waitForURL('**/jobs');

  await uploadResumePage.clickProfileMenu();
  await uploadResumePage.goToProfile();
  await uploadResumePage.navigateToResumeSection();
  await uploadResumePage.deleteExistingResume();
  await uploadResumePage.confirmDelete();
  await uploadResumePage.uploadNewResume(); 
  
  // Verify DB
  const profile = await getCandidateProfileByEmail(candidate.email);
  expect(profile).toBeTruthy();
  const resume = await getCandidateResumeUrl(profile.user_id);
  expect(resume).toBeTruthy();
});
