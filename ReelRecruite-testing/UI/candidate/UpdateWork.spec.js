import { test, expect } from '@playwright/test';
import { loadCredentials } from '../../support/candidateCredentials.js';
import { Login } from '../../Pages/Login.js';
import { UpdateWorkPage } from '../../Pages/UpdateWork.js';
import { getCandidateWorkExperience, getCandidateProfileByEmail } from '../../support/candidateDb.helper.js';


const candidate = loadCredentials()[0];

test('Candidate deletes existing work (if any) and adds new experience', async ({ page }) => {
  const loginPage = new Login(page);
  const updateWorkPage = new UpdateWorkPage(page);
  await loginPage.goto();
  await loginPage.login(candidate.email, candidate.password);
  await loginPage.clickSignIn();
  await page.waitForURL('**/jobs');

  await updateWorkPage.openProfileDropdown();
  await updateWorkPage.openProfile();
  await updateWorkPage.navigateToWorkSection();
  await updateWorkPage.deleteIfVisibleAndProceed();
  await updateWorkPage.clickAddWork();
  await updateWorkPage.addCompany('Tech Solutions Inc');
  await updateWorkPage.addPosition('Senior Software Engineer');
  await updateWorkPage.addEmploymentType('Full-time');
  await updateWorkPage.addLocationType('On-site');
  await updateWorkPage.addStartDate('2021-01-01');
  await updateWorkPage.addEndDate();
  await updateWorkPage.addDescription('Led QA automation initiatives and improved delivery quality');
  await updateWorkPage.addAchievement(['Reduced regression failures by 40%','Introduced Playwright automation']);
  await updateWorkPage.addSkill(['Playwright','JavaScript']);
  await updateWorkPage.saveChanges();

  // Verify DB using helper
  const profile = await getCandidateProfileByEmail(candidate.email);
  const userId = profile ? (profile.user_id || profile.userId) : null;
  const work = userId ? await getCandidateWorkExperience(userId) : null;
  expect(JSON.stringify(work)).toContain('Tech Solutions Inc');
});
