import { expect } from '@playwright/test';
export class ApplyJobPage {
  constructor(page) {
    this.page = page;
    this.applyNowButton = page.getByTestId('job-apply-button');
    this.recordVideoButton = page.getByTestId('application-video-content');
    this.startRecordingButton = page.getByTestId('start-recording-button');
    this.stopRecordingButton = page.getByTestId('stop-recording-button');
    this.confirmVideoButton = page.getByTestId('use-video-button');
    this.firstQuestion = page.getByTestId('dynamic-input-2f9fd407-83fb-4998-bb46-ad8226de76ff');
    this.secondQuestion = page.getByLabel('boolean-yes-radio-7113bc77-6cbd-4b9a-8863-76d8a885a5c5');
    this.submitButton = page.getByTestId('submit-application-button');
    this.maybeLaterButton = page.getByRole('button', { name: 'Maybe Later' });

  }
  async handleMaybeLaterIfPresent() {
    try {
      await this.maybeLaterButton.waitFor({
        state: 'visible',
        timeout: 2500
      });
      await this.maybeLaterButton.click();
      await this.maybeLaterButton.waitFor({ state: 'hidden' });
    } catch {
      // Modal did not appear — safe to continue
    }
  }

  async applyNow() {
    await this.applyNowButton.waitFor({ state: 'visible' });
    await this.applyNowButton.click();
  }

  async recordVideo() {
    await this.recordVideoButton.waitFor({ state: 'visible' });
    await this.recordVideoButton.click();
    await this.startRecordingButton.click();
    await this.page.waitForTimeout(10000);
    console.log('Video recording started.');
  }

  async stopRecording() {
    await this.stopRecordingButton.waitFor({ state: 'visible' });
    await this.stopRecordingButton.click();
    await this.confirmVideoButton.waitFor({ state: 'visible' });
    await this.confirmVideoButton.click();
    await this.confirmVideoButton.waitFor({ state: 'detached' });
    console.log('Video recording stopped.');
  }


  async answerOne() {
    const firstQuestion = this.page.locator('input[type="text"], textarea').first();
    await firstQuestion.waitFor({ state: 'visible', timeout: 10000 });

    const answer =
      'I have 5 years of experience in software testing, specializing in automation and performance testing. I am proficient in tools like Selenium, JIRA, and Postman. I have worked in Agile environments and have a strong understanding of SDLC.';

    await firstQuestion.fill(answer);
    await expect(firstQuestion).toHaveValue(answer);
    console.log('Answer 1 filled.');
  }


  async answerTwo() {
    const yesRadio = this.page.getByLabel('Yes').first();
    await yesRadio.waitFor({ state: 'visible', timeout: 10000 });
    await yesRadio.check();
    console.log('Answer 2 checked.');
  }
  async submitApplication() {
    await this.submitButton.waitFor({ state: 'visible' });
    await this.submitButton.click();
    await this.page.waitForLoadState('networkidle');
    console.log('Application submitted.');
  }

}
