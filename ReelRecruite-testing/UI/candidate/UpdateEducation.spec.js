import { test, expect } from '@playwright/test';
import { Login } from '../../Pages/Login.js';
import { loadCredentials } from '../../support/candidateCredentials.js';
import { UpdateEducationPage } from '../../Pages/UpdateEducation.js';
import { getCandidateEducation, getCandidateProfileByEmail } from '../../support/candidateDb.helper.js';

const candidate = loadCredentials()[0];

test('candidate can update education', async ({ page }) => {
  const loginPage = new Login(page);
  const educationPage = new UpdateEducationPage(page);
  await loginPage.goto();
  await loginPage.login(candidate.email, candidate.password);
  await loginPage.clickSignIn();
  await page.waitForURL('**/jobs');

  await educationPage.clickProfile();
  await educationPage.openProfile();
  await educationPage.navigateToEducation();
  await educationPage.deleteIfVisibleAndProceed();
  await educationPage.clickAddEducation();
  await educationPage.updateSchool('Harvard University');
  await educationPage.updateDegree('Bachelor of Science');
  await educationPage.updateFieldOfStudy('Computer Science');
  await educationPage.updateGPA('4.0');
  await educationPage.updateLocation('Boston, MA');
  await educationPage.updateStartDate('2021-01-01');
  await educationPage.updateEndDate(); 
  await educationPage.updateDescription('Graduated with honors.');
  await educationPage.saveChanges();

  // Verify DB using helper
  const profile = await getCandidateProfileByEmail(candidate.email);
  const userId = profile ? (profile.user_id || profile.userId) : null;
  const education = userId ? await getCandidateEducation(userId) : null;
  expect(education).toBeTruthy();
  const eduStr = JSON.stringify(education);

  // Verify all fields we updated are present in the stored education JSON
  expect(eduStr).toContain('Harvard University');
  expect(eduStr).toContain('Bachelor of Science');
  expect(eduStr).toContain('Computer Science');
  expect(eduStr).toContain('4.0');
  expect(eduStr).toContain('Boston, MA');
  expect(eduStr).toContain('2021-01-01');
  expect(eduStr).toContain('Graduated with honors.');
});
