import {test} from '@playwright/test';
import {loadCredentials} from '../../support/recruiterCredentials.js';
import {Login} from '../../Pages/Login.js';

const recruiter = loadCredentials()[0];


test('Candidate can log in using phone number', async ({ page }) => {
    const loginPage = new Login(page);
    await loginPage.goto();
    await loginPage.phoneLogin(recruiter.phone);
    await loginPage.clickSignIn();
}); 