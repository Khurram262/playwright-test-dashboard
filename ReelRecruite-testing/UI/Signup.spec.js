import { test } from '@playwright/test';
import { SignupPage } from '../Pages/SignupPage.js';
import {getRandomUser,storeNewUser} from '../support/signupCredentials.helper.js';
import { verifyUserCreated } from '../support/signupDb.helper.js';

test('Candidate signs up and moves user from RandomUsers to NewUsers', async ({ page }) => {
  const signupPage = new SignupPage(page);

  const user = getRandomUser();

    await signupPage.goto();
    await signupPage.register();

    await signupPage.enterFullName(user.fullName);
    await signupPage.enterEmail(user.email);
    await signupPage.enterPhone(user.phone);
    await signupPage.enterPassword(user.password);
    await signupPage.enterConfirmPassword(user.password);
    await signupPage.selectRole('Job Seeker');
    await signupPage.createAccount();
    await signupPage.fillOTP('123456');

    // DB verification
    await verifyUserCreated(user.email);
    storeNewUser(user);

});
