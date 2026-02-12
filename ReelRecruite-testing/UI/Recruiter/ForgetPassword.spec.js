import { test } from '@playwright/test';
import { Login } from '../../Pages/Login.js';
import { ForgetPassword } from '../../Pages/ForgetPassword.js';
import { loadCredentials } from '../../support/recruiterCredentials.js';
import { changeRecruiterPassword, verifyPasswordUpdatedInDb } from '../../support/password.helper.js';

test('Recruiter forget password flow', async ({ page }) => {
  const recruiters = loadCredentials();
  const recruiter = recruiters[0];

  const otp = '123456';
  const oldPassword = recruiter.password;
  const newPassword = `${oldPassword}`; 
  const loginPage = new Login(page);
  await loginPage.goto();

  const forgetPasswordPage = new ForgetPassword(page);
  await forgetPasswordPage.clickForgetPassword();
  await forgetPasswordPage.enterEmail(recruiter.email);
  await forgetPasswordPage.clickGetCode();
  await forgetPasswordPage.fillOTP(otp);
  await forgetPasswordPage.clickContinue();
  await forgetPasswordPage.enterNewPassword(newPassword, newPassword);
  await forgetPasswordPage.clickSavePassword();

  // Verify Db
  await verifyPasswordUpdatedInDb(recruiter.email, oldPassword, newPassword);

  // update credentials in json
  await changeRecruiterPassword(recruiter.email, newPassword);
  console.log(`Password updated in Credentials.json for ${recruiter.email}`);
});
