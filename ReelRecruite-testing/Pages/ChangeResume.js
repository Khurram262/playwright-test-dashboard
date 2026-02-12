import { getResumePath } from '../support/resume.helper.js';
import { expect } from '@playwright/test';

export class UploadResume {
  constructor(page) {
    this.page = page;

    this.profileMenu = page.getByTestId('navbar-user-menu-trigger').first();
    this.ProfileButton = page.getByTestId('navbar-user-menu-item-profile').first();
    this.resumeSection = page.getByTestId('resume-header').first();
    this.deleteResumeButton = page.getByTestId('remove-resume-button');
    this.confirmDeleteButton = page.getByTestId('remove-resume-confirm-button');
    this.maybeLaterButton = page.getByRole('button', { name: 'Maybe Later' });
    this.uploadInput = page.getByTestId('upload-resume-label');
  }

  async handleMaybeLaterIfPresent() {
    if (await this.maybeLaterButton.isVisible()) {
      await this.maybeLaterButton.waitFor({ state: 'visible' });
      await this.maybeLaterButton.click();
      await expect(this.maybeLaterButton).toBeHidden();
      console.log('Handled Maybe Later modal');
    }
  }

  async clickProfileMenu() {
    await this.profileMenu.waitFor({ state: 'visible' });
    await expect(this.profileMenu).toBeVisible();
    await this.profileMenu.click();
    console.log('Profile menu clicked');
  }

  async goToProfile() {
    await this.ProfileButton.waitFor({ state: 'visible' });
    await expect(this.ProfileButton).toBeVisible();
    await this.ProfileButton.click();
    await this.handleMaybeLaterIfPresent();
    console.log('Navigated to Profile page');
  }

  async navigateToResumeSection() {
    await this.resumeSection.waitFor({ state: 'visible' });
    await expect(this.resumeSection).toBeVisible();
    await this.resumeSection.scrollIntoViewIfNeeded();
    console.log('Scrolled to Resume section');
  }

  async deleteExistingResume() {
    if (await this.uploadInput.isVisible()) {
      console.log('No existing resume to delete');
      return;
    }

    if (await this.deleteResumeButton.isVisible()) {
      await this.deleteResumeButton.waitFor({ state: 'visible' });
      await expect(this.deleteResumeButton).toBeVisible();
      await this.deleteResumeButton.click();
      await this.handleMaybeLaterIfPresent();
      console.log('Existing resume deleted');
    }
  }

  async confirmDelete() {
    if (await this.confirmDeleteButton.isVisible()) {
      await this.confirmDeleteButton.waitFor({ state: 'visible' });
      await this.confirmDeleteButton.click();
      await this.handleMaybeLaterIfPresent();
      console.log('Confirmed resume deletion');
    }
  }

  async uploadNewResume(filename = 'Bold-Poster.pdf') {
  
  await this.handleMaybeLaterIfPresent();
  const resumePath = getResumePath(filename);
  await this.uploadInput.waitFor({ state: 'attached' });

  await Promise.all([
    this.page.waitForResponse(
      r =>
        r.request().method() === 'POST' &&
        r.status() === 200,
      { timeout: 20_0000 }
    ),
    this.uploadInput.setInputFiles(resumePath)
  ]);
  console.log(`Resume upload completed: ${resumePath}`);
}

}
