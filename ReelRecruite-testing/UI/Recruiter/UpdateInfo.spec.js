import {test, expect} from '@playwright/test';
import {loadCredentials} from '../../support/recruiterCredentials.js';
import {Login} from '../../Pages/Login.js';
import {UpdateInfoPage} from '../../Pages/UpdateInfo.js';
import { getRecruiterPublicFieldsByEmail } from '../../support/recruiterDb.helper.js';

const recruiter = loadCredentials()[0];



test('recruuiter info, profile picture, and banner update', async ({ page }) => {
  const loginPage = new Login(page);
  const updateInfoPage = new UpdateInfoPage(page);
  await loginPage.goto();
  await loginPage.login(recruiter.email, recruiter.password);
  await loginPage.clickSignIn();
  await page.waitForURL('**/my-jobs');
  
  await updateInfoPage.openProfileMenu();
  await updateInfoPage.clickProfile();
  await updateInfoPage.clickEditProfile();
  await updateInfoPage.uploadCoverImage();
  await updateInfoPage.uploadProfilePicture();
  await updateInfoPage.fillFullName('Sabir SQA');
  await updateInfoPage.fillProfessionalTitle('Senior QA Engineer');
  await updateInfoPage.clickSaveChanges();

  // Verify DB changes
  const db = await getRecruiterPublicFieldsByEmail(recruiter.email);
  expect(db.full_name).toBe('Sabir SQA');
  expect(db.title).toBe('Senior QA Engineer');
  expect(db.avatar_url).toBeTruthy();
  expect (db.cover_url).toBeTruthy();
});