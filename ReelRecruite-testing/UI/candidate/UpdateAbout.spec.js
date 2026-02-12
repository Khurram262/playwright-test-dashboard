import { test, expect } from '@playwright/test';
import { loadCredentials } from '../../support/candidateCredentials.js';
import { Login } from '../../Pages/Login.js';
import { UpdateAboutPage } from '../../Pages/UpdateAbout.js';
import { getUserByEmail } from '../../support/candidateDb.helper.js';


const candidate = loadCredentials()[0];

test('candidate can update about section', async ({ page }) => {
  const loginPage = new Login(page);
  const updateAbout = new UpdateAboutPage(page);

  await loginPage.goto();
  await loginPage.login(candidate.email, candidate.password);
  await loginPage.clickSignIn();
  await page.waitForURL('**/jobs');
 
  await updateAbout.clickProfile()
  await updateAbout.openProfile();
  await updateAbout.clickEditAbout();
  await updateAbout.updateBio('Experienced software engineer with a passion for developing innovative programs that expedite the efficiency and effectiveness of organizational success.');
  await updateAbout.updateCountry('United States');
  await updateAbout.updateLocation('San Francisco, CA');
  await updateAbout.saveChanges();

  // Verify DB
  const db = await getUserByEmail(candidate.email);
  expect(db.bio).toContain('Experienced software engineer');
  expect(db.country).toBe('United States');
  expect(db.location).toBe('San Francisco, CA');
});
  