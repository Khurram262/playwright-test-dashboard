import { test, expect } from '@playwright/test';
import { loadCredentials } from '../../support/recruiterCredentials.js';
import { Login } from '../../Pages/Login.js';
import { CompanyDetailsPage } from '../../Pages/UpdateCompanyDetails.js';
import { getCompanyProfileByEmail } from '../../support/recruiterDb.helper.js';

const recruiter = loadCredentials()[0];


test('Recruiter updates company details and logo', async ({ page }) => {
  const loginPage = new Login(page);
  await loginPage.goto();
  await loginPage.login(recruiter.email, recruiter.password);
  await loginPage.clickSignIn();
  await page.waitForURL('**/my-jobs');
  
  const companyPage = new CompanyDetailsPage(page);
  await companyPage.openProfileMenu();
  await companyPage.navigateToProfile();
  await companyPage.navigateToCompanyDetails();
  await companyPage.clickEditDetails();

  await companyPage.updateCompanyLogo();
  await companyPage.updateCompanyName('Reel Recruit AI');
  await companyPage.updateTagLine('Hire smarter with video resumes');
  await companyPage.updateDescription('Revolutionizing recruitment with AI-driven video resumes.');
  await companyPage.updateIndustry('Information Technology');
  await companyPage.updateCompanySize('51-200 employees');
  await companyPage.updateLocation('New York, NY');
  await companyPage.updateWebsite('https://reelrecruitai.com');
  await companyPage.updateLinkedIn('https://linkedin.com/reelrecruitai');
  await companyPage.updateTwitter('https://twitter.com/reelrecruitai');
  await companyPage.updateFacebook('https://facebook.com/reelrecruitai');
  await companyPage.updateContactEmail('IuYQ4@example.com');
  await companyPage.updateContactNumber('123-456-7890');
  await companyPage.clickSaveChanges();

  // Verify DB
  const db = await getCompanyProfileByEmail(recruiter.email);
  expect(db.company_name).toBe('Reel Recruit AI');
  expect(db.tagline).toBe('Hire smarter with video resumes');
  expect(db.website).toBe('https://reelrecruitai.com');
  
});
