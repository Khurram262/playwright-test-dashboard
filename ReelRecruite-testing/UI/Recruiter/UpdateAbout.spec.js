import { test, expect } from '@playwright/test';
import { loadCredentials } from '../../support/recruiterCredentials.js';
import { Login } from '../../Pages/Login.js';
import { UpdateAboutPage } from '../../Pages/UpdateAbout.js';
import { getUserByEmail } from '../../support/recruiterDb.helper.js';


const recruiter = loadCredentials()[0];

test('recruiter can update about section', async ({ page }) => {
  const loginPage = new Login(page);
  const updateAbout = new UpdateAboutPage(page);

  await loginPage.goto();
  await loginPage.login(recruiter.email, recruiter.password);
  await loginPage.clickSignIn();
  await page.waitForURL('**/my-jobs');
  
  await updateAbout.clickProfile()
  await updateAbout.openProfile();
  await updateAbout.clickEditAbout();
  await updateAbout.updateBio('Experienced software engineer with a passion for developing innovative programs that expedite the efficiency and effectiveness of organizational success.');
  await updateAbout.updateCountry('United States');
  await updateAbout.updateLocation('San Francisco, CA');
  await updateAbout.saveChanges();
  
  // Verify DB
  const db = await getUserByEmail(recruiter.email);
  expect(db.bio).toContain('Experienced software engineer');
  expect(db.country).toBe('United States');
  expect(db.location).toBe('San Francisco, CA');
});
