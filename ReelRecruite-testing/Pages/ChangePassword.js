import { promises as fs } from 'fs';
import { expect } from '@playwright/test';

export class ChangePassword {
  constructor(page) {
    this.page = page;

    this.profileMenu = page.getByTestId('navbar-user-menu-trigger').first();
    this.settingsButton = page.getByTestId('navbar-user-menu-item-settings').first();
    this.oldPasswordInput = page.getByTestId('current-password-input');
    this.newPasswordInput = page.getByTestId('new-password-input');
    this.saveChangesButton = page.getByTestId('update-password-submit');
    this.maybeLaterButton = page.getByRole('button', { name: 'Maybe Later' });
  }

  async handleMaybeLaterIfPresent() {
    if (await this.maybeLaterButton.isVisible()) {
      await expect(this.maybeLaterButton).toBeVisible();
      await this.maybeLaterButton.click();
      await expect(this.maybeLaterButton).toBeHidden();
      
    }
  }

  async openProfileMenu() {
    await this.profileMenu.waitFor({ state: 'visible' });
    await this.profileMenu.click();
    console.log('Profile menu opened.');
  }

  async navigateToSettings() {
    await this.settingsButton.waitFor({ state: 'visible' });
    await this.settingsButton.click();
    console.log('Navigated to Settings.');
  }

 async changePassword(oldPassword, newPassword) {

  await this.oldPasswordInput.waitFor({ state: 'visible' });
  await this.oldPasswordInput.fill(oldPassword);
  const filledOldPassword = await this.oldPasswordInput.inputValue();
  expect(filledOldPassword).toBe(oldPassword);
  await this.oldPasswordInput.blur();

  await this.newPasswordInput.waitFor({ state: 'visible' });
  await this.newPasswordInput.fill(newPassword);
  const filledNewPassword = await this.newPasswordInput.inputValue();
  expect(filledNewPassword).toBe(newPassword);
  await this.newPasswordInput.blur();

  console.log(`Password updated ${ newPassword}`);
}

  async saveChanges() {
    await this.saveChangesButton.waitFor({ state: 'visible' });
    await this.saveChangesButton.click();
    console.log('Changes saved.');
  }

  static async readCredentials(filePath) {
    if (!filePath) throw new Error('Credentials file path is required');

    const fileExists = await fs.stat(filePath).catch(() => null);
    expect(fileExists).toBeTruthy();

    const data = await fs.readFile(filePath, 'utf-8');
    expect(data).toBeTruthy();

    const candidates = JSON.parse(data);
    expect(Array.isArray(candidates) && candidates.length > 0).toBe(true);

    return candidates[0];
  }

  static async updateCredentialsJSON(filePath, email, newPassword) {
    const data = await fs.readFile(filePath, 'utf-8');
    expect(data).toBeTruthy();

    const candidates = JSON.parse(data);
    expect(Array.isArray(candidates) && candidates.length > 0).toBe(true);

    const updated = candidates.map(c =>
      c.email === email ? { ...c, password: newPassword } : c
    );

    await fs.writeFile(filePath, JSON.stringify(updated, null, 2), 'utf-8');

    const checkData = await fs.readFile(filePath, 'utf-8');
    expect(checkData).toContain(newPassword);
  }
}
