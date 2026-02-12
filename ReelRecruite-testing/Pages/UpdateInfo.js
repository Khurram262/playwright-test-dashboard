import { expect } from '@playwright/test';
import { getBannerImagePath, getProfileImagePath } from '../support/profileMedia.helper.js';

export class UpdateInfoPage {
  constructor(page) {
    this.page = page;
    this.maybeLaterButton = page.getByRole('button', { name: 'Maybe Later' });
    this.profileMenu = page.getByTestId('navbar-user-menu-trigger').first();
    this.profileButton = page.getByTestId('navbar-user-menu-item-profile').first();
    this.editProfileButton = page.getByTestId('edit-profile-info-button');
    this.coverImageButton = page.getByTestId('edit-profile-cover-upload-button');
    this.profilePictureEditButton = page.getByTestId('edit-profile-avatar-upload-button');
    this.fullNameTextbox = page.locator('#fullName');
    this.professionalTitleTextbox = page.locator('#title');

    this.saveChangesButton = page.getByTestId('profile-save-changes-button');
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
  }

  async handleMaybeLaterIfPresent() {
    try {
      await this.maybeLaterButton.waitFor({ state: 'visible', timeout: 2500 });
      await expect(this.maybeLaterButton).toBeVisible();
      await this.maybeLaterButton.click();
      await expect(this.maybeLaterButton).toBeHidden();
    } catch {}
  }

  async openProfileMenu() {
    await this.profileMenu.waitFor({ state: 'visible' });
    await expect(this.profileMenu).toBeVisible();
    await this.profileMenu.click();
    console.log('Profile menu opened');
  }

  async clickProfile() {
    await this.profileButton.waitFor({ state: 'visible' });
    await expect(this.profileButton).toBeVisible();
    await this.profileButton.click();
    console.log('Navigated to profile page');
  }

  async clickEditProfile() {
    await this.editProfileButton.waitFor({ state: 'visible' });
    await expect(this.editProfileButton).toBeVisible();
    await this.editProfileButton.click();
    console.log('Edit profile button clicked');
  }

  async uploadCoverImage() {
    await this.handleMaybeLaterIfPresent();
    const bannerPath = getBannerImagePath();

    await this.coverImageButton.waitFor({ state: 'visible' });
    await this.page.locator('input[type="file"]').first().waitFor({ state: 'attached' });
    await this.page.locator('input[type="file"]').first().setInputFiles(bannerPath);
    await this.page.locator('input[type="file"]').first().evaluate(input =>
      input.dispatchEvent(new Event('change', { bubbles: true }))
    );
    console.log('Cover image uploaded:', bannerPath);
  }

  async uploadProfilePicture() {
    await this.handleMaybeLaterIfPresent();
    const profilePath = getProfileImagePath();
    await this.profilePictureEditButton.waitFor({ state: 'visible' });
    await this.page.locator('input[type="file"]').last().waitFor({ state: 'attached' });
    await this.page.locator('input[type="file"]').last().setInputFiles(profilePath);
    await this.page.locator('input[type="file"]').last().evaluate(input =>
      input.dispatchEvent(new Event('change', { bubbles: true }))
    );
    console.log('Profile picture uploaded:', profilePath);
  }

  async clearAndTypeUsingKeyboard(locator, value) {
    await locator.waitFor({ state: 'visible' });
    await expect(locator).toBeEnabled();
    await locator.click();
    await locator.press('Control+A');
    await locator.press('Backspace');
    await locator.type(value);
    const typedValue = await locator.inputValue();
    expect(typedValue).toBe(value);
  }

  async fillFullName(name) {
    await this.clearAndTypeUsingKeyboard(this.fullNameTextbox, name);
    await expect(this.fullNameTextbox).toHaveValue(name);
    console.log('Full name updated:', name);
  }

  async fillProfessionalTitle(title) {
    await this.clearAndTypeUsingKeyboard(this.professionalTitleTextbox, title);
    await expect(this.professionalTitleTextbox).toHaveValue(title);
    console.log('Professional title updated:', title);
  }

  async clickSaveChanges() {
    await this.saveChangesButton.waitFor({ state: 'visible' });
    await this.saveChangesButton.click();

    console.log('Changes saved');
  }
}
