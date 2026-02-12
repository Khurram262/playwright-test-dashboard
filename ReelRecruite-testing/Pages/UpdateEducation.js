import { expect } from '@playwright/test';

export class UpdateEducationPage {
  constructor(page) {
    this.page = page;

    this.profileMenu = page.getByTestId('navbar-user-menu-trigger').first();
    this.ProfileButton = page.getByTestId('navbar-user-menu-item-profile').first();

    this.educationSection = page.getByTestId('education-section');
    this.deleteEduButton = page.getByTestId('delete-education-button');
    this.confirmDeleteButton = page.getByRole('button', { name: 'Ok' });
    this.addEducationButton = page.getByTestId('add-education-button-empty');

    this.schoolTextbox = page.getByTestId('education-institution-input-0');
    this.degreeTextbox = page.getByTestId('education-degree-input-0');
    this.fieldOfStudyTextbox = page.getByTestId('education-field-input-0');
    this.gpaTextbox = page.getByTestId('education-grade-input-0');
    this.locationTextbox = page.getByTestId('education-location-input-0');
    this.startDateInput = page.getByTestId('education-start-date-input-0');
    this.endDateTextbox = page.getByTestId('education-current-checkbox-0');
    this.descriptionTextbox = page.getByTestId('education-description-input-0');
    this.saveChangesButton = page.getByRole('button', { name: 'Add Education' }).last();
    this.maybeLaterButton = page.getByRole('button', { name: 'Maybe Later' });
  }

  async handleMaybeLaterIfPresent() {
    try {
      await this.maybeLaterButton.waitFor({ state: 'visible', timeout: 2000 });
      await expect(this.maybeLaterButton).toBeVisible();
      await this.maybeLaterButton.click();
      await expect(this.maybeLaterButton).toBeHidden();
      console.log('Handled "Maybe Later" modal');
    } catch {}
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
    console.log(`Typed value: "${value}"`);
  }

  async clickProfile() {
    await this.profileMenu.waitFor({ state: 'visible', timeout: 10000 });
    await expect(this.profileMenu).toBeVisible();
    await this.profileMenu.click();
    console.log('Clicked profile menu');
  }

  async openProfile() {
    await this.ProfileButton.waitFor({ state: 'visible' });
    await expect(this.ProfileButton).toBeVisible();
    await this.ProfileButton.click();
    await this.page.waitForLoadState('networkidle');
    console.log('Opened profile');
  }

  async navigateToEducation() {
    await this.educationSection.scrollIntoViewIfNeeded();
    await expect(this.educationSection).toBeVisible();
    console.log('Navigated to Education section');
  }

  async deleteEducation() {
    await this.deleteEduButton.waitFor({ state: 'visible' });
    await this.deleteEduButton.click();
    console.log('Clicked delete education');
  }

  async confirmDelete() {
    await this.confirmDeleteButton.waitFor({ state: 'visible' });
    await this.confirmDeleteButton.click();
    console.log('Confirmed delete');
  }

  async deleteIfVisibleAndProceed() {
    const isDeleteVisible = await this.deleteEduButton.isVisible().catch(() => false);
    if (isDeleteVisible) {
      await this.deleteEduButton.click({ force: true });
      await this.confirmDeleteButton.waitFor({ state: 'visible' });
      await this.confirmDeleteButton.click();
      await this.handleMaybeLaterIfPresent();
      console.log('Deleted existing education entry');
    } else {
      console.log('No education entry to delete');
    }
  }

  async clickAddEducation() {
    await this.addEducationButton.waitFor({ state: 'visible' });
    await expect(this.addEducationButton).toBeVisible();
    await this.addEducationButton.click();
    console.log('Clicked "Add Education" button');
  }

  async updateSchool(school) {
    await this.clearAndTypeUsingKeyboard(this.schoolTextbox, school);
    console.log(`Updated school: ${school}`);
  }

  async updateDegree(degree) {
    await this.clearAndTypeUsingKeyboard(this.degreeTextbox, degree);
    console.log(`Updated degree: ${degree}`);
  }

  async updateFieldOfStudy(fieldOfStudy) {
    await this.clearAndTypeUsingKeyboard(this.fieldOfStudyTextbox, fieldOfStudy);
    console.log(`Updated field of study: ${fieldOfStudy}`);
  }

  async updateGPA(gpa) {
    await this.clearAndTypeUsingKeyboard(this.gpaTextbox, gpa);
    console.log(`Updated GPA: ${gpa}`);
  }

  async updateLocation(location) {
    await this.clearAndTypeUsingKeyboard(this.locationTextbox, location);
    console.log(`Updated location: ${location}`);
  }

  async updateStartDate(startDate) {
    await this.startDateInput.waitFor({ state: 'visible' });
    await this.startDateInput.fill(startDate);
    const value = await this.startDateInput.inputValue();
    expect(value).toBe(startDate);
    console.log(`Updated start date: ${startDate}`);
  }

  async updateEndDate() {
    await this.endDateTextbox.waitFor({ state: 'visible' });
    await this.endDateTextbox.check();
    expect(await this.endDateTextbox.isChecked()).toBe(true);
    console.log('Checked "I am currently studying here"');
  }

  async updateDescription(description) {
    await this.clearAndTypeUsingKeyboard(this.descriptionTextbox, description);
    console.log(`Updated description: ${description}`);
  }

  async saveChanges() {
    await this.saveChangesButton.waitFor({ state: 'visible' });
    await this.saveChangesButton.click();
    console.log('Saved education changes');
  }
}
