import {test, expect} from '@playwright/test';
import {loadCredentials}from '../../support/candidateCredentials.js';
import {Login} from '../../Pages/Login.js';
import {UpdateInfoPage} from '../../Pages/UpdateInfo.js';
import { getUserByEmail } from '../../support/candidateDb.helper.js';

const candidate = loadCredentials()[0];

test('Candidate info, profile picture, and banner update', async ({ page }) => {
  const loginPage = new Login(page);
   const updateInfoPage = new UpdateInfoPage(page);
  await loginPage.goto();
  await loginPage.login(candidate.email, candidate.password);
  await loginPage.clickSignIn();

  await updateInfoPage.openProfileMenu();
  await updateInfoPage.clickProfile();
  await updateInfoPage.clickEditProfile();
  await updateInfoPage.uploadCoverImage();
  await updateInfoPage.uploadProfilePicture();
  await updateInfoPage.fillFullName('Sabir SQA');
  await updateInfoPage.fillProfessionalTitle('Senior QA Engineer');
  await updateInfoPage.clickSaveChanges();

  // Verify DB
  const db = await getUserByEmail(candidate.email);
  expect(db.full_name).toBe('Sabir SQA');
  expect(db.title).toBe('Senior QA Engineer');
  expect(db.avatar_url).toBeTruthy();
  expect(db.cover_url).toBeTruthy();
});