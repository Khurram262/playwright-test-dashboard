import {test} from '@playwright/test';
import {loadCredentials} from '../../support/recruiterCredentials.js';
import {Login} from '../../Pages/Login.js';
import { SaveDraft } from '../../Pages/SaveDraft.js';


const recruiter = loadCredentials()[0];



test ('Recruiter saves a job draft', async ({page}) => {
  const login = new Login (page);
  const saveDraft = new SaveDraft (page);

  await login.goto();
  await login.login(recruiter.email, recruiter.password);
  await login.clickSignIn();
  await page.waitForURL('**/my-jobs');
  await saveDraft.clickIfVisible();
  
  await saveDraft.postJob();
  await saveDraft.fillBasicInfo();
  await saveDraft.saveDraft();
  
});