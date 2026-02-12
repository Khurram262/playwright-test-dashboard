import { test, expect } from '@playwright/test';
import { loadCredentials } from '../../support/candidateCredentials.js';
import { Login } from '../../Pages/Login.js';
import { UpdateSkillsPage } from '../../Pages/UpdateSkils.js';
import { getCandidateSkills, getCandidateProfileByEmail } from '../../support/candidateDb.helper.js';


const candidate = loadCredentials()[0];


test('candidate can update skills section', async ({ page }) => {
  const loginPage = new Login(page);
  const updateSkills = new UpdateSkillsPage(page);

  await loginPage.goto();
  await loginPage.login(candidate.email, candidate.password);
  await loginPage.clickSignIn();
  await page.waitForURL('**/jobs');
  
  await updateSkills.clickProfile();
  await updateSkills.openProfile();
  await updateSkills.clickEditSkills();
  await updateSkills.updateSkills([
    'JavaScript',
    'Playwright',
    'Selenium',
    'Test Automation']);

  // Verify DB using helper
  const profile = await getCandidateProfileByEmail(candidate.email);
  const userId = profile ? (profile.user_id || profile.userId) : null;
  const skills = userId ? await getCandidateSkills(userId) : null;
  expect(skills).toEqual(expect.arrayContaining(['JavaScript','Playwright','Selenium','Test Automation']));
});


