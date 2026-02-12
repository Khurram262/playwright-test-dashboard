import {expect} from '@playwright/test';

export class UpdateWorkPage {
  constructor(page) {
    this.page = page;

    this.profileMenu = page.getByTestId('navbar-user-menu-trigger').first();
    this.profileButton = page.getByTestId('navbar-user-menu-item-profile').first();
    this.workExperienceSection = page.getByTestId('work-experience-header');
    this.deleteWorkButton = page.getByTestId('delete-experience-button');
    this.confirmDeleteButton = page.getByRole('button', { name: 'Ok' });
    this.addWorkButton = page.getByTestId('add-work-experience-button-empty');
    this.companyInput = page.getByTestId('experience-company-input-0');
    this.positionInput = page.getByTestId('experience-position-input-0');
    this.employmentTypeDropdown = page.getByTestId('experience-employment-type-select-0');
    this.locationTypeDropdown = page.getByTestId('experience-location-type-select-0');
    this.locationInput = page.getByTestId('experience-location-input-0');
    this.startDateInput = page.getByTestId('experience-start-date-input-0');
    this.endDateInput = page.getByTestId('experience-current-checkbox-0');
    this.descriptionInput = page.getByTestId('experience-description-input-0');
    this.achievementInput = page.getByTestId('experience-achievement-input-0');
    this.skillInput = page.getByTestId('experience-skill-input-0');
    this.saveButton = page.getByRole('button', { name: 'Add Experience' }).last();
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
  async selectDropdownByLabel(dropdown, label) {
    await dropdown.waitFor({ state: 'visible' });
    await dropdown.selectOption({ label });
    console.log(`Dropdown selected: "${label}"`);
  }
  

  async clearAndFill(input, value) {
    await input.waitFor({ state: 'visible' });
    await input.fill('');
    await input.fill(value);
  }

  async openProfileDropdown() {
    await this.profileMenu.waitFor({ state: 'visible' });
    await this.profileMenu.click();
    console.log('Profile menu opened');
  }

  async openProfile() {
    await this.profileButton.waitFor({ state: 'visible' });
    await this.profileButton.click();
    await this.page.waitForLoadState('networkidle');
    console.log('Navigated to Profile page');
  }

async navigateToWorkSection() {
    await this.workExperienceSection.waitFor({ state: 'visible' });
    await this.workExperienceSection.click();
    console.log('Navigated to Work Experience section');
  }

  async deleteWorkExperience() {
    await this.deleteWorkButton.waitFor({ state: 'visible' });
    await this.deleteWorkButton.click();
    console.log('Work experience deleted');
  }

  async confirmDelete() {
    await this.confirmDeleteButton.waitFor({ state: 'visible' });
    await this.confirmDeleteButton.click();
    await this.page.waitForLoadState('networkidle');
    console.log('Confirmed delete');
  }
  

async deleteIfVisibleAndProceed() {
  const isDeleteVisible = await this.deleteWorkButton.isVisible().catch(() => false);

  if (isDeleteVisible) {
    await this.deleteWorkButton.click();
    await this.confirmDeleteButton.waitFor({ state: 'visible' });
    await this.confirmDeleteButton.click();
    await this.page.waitForLoadState('networkidle');
  }
}

  
  async clearAndTypeUsingKeyboard(locator, value) {
    await locator.waitFor({ state: 'visible' });
    await locator.click();
    await locator.press('Control+A');
    await locator.press('Backspace');
    await locator.type(value);
  }

  async clickAddWork() {
    await this.addWorkButton.waitFor({ state: 'visible' });
    await this.addWorkButton.click();
    console.log('clicked add work button');
  }

  async addCompany(company){
    await this.clearAndTypeUsingKeyboard(this.companyInput, company);
    console.log('added company');
  }


  async addPosition(position){
    await this.clearAndTypeUsingKeyboard(this.positionInput, position);
    console.log('added position');
  }


  async addEmploymentType(employmentType){
    await this.selectDropdownByLabel(this.employmentTypeDropdown, employmentType);
    console.log('added employment type');
  }


  async addLocationType(locationType){
    await this.selectDropdownByLabel(this.locationTypeDropdown, locationType);
    console.log('added location type');
  }

  async addLocation(location){
    await this.clearAndTypeUsingKeyboard(this.locationInput, location);
    console.log('added location');
  }


  async addStartDate(startDate){
    await this.startDateInput.waitFor({ state: 'visible' });
    await this.startDateInput.fill(startDate);
    console.log('added start date');
  }


  async addEndDate(){
    await this.endDateInput.waitFor({ state: 'visible' });
    await this.endDateInput.check();
    console.log('added end date');
  }


  async addDescription(description){
    await this.clearAndTypeUsingKeyboard(this.descriptionInput, description);
    console.log('added description');
  }


  async addAchievement(achievements){
    for (const achievement of achievements) {
      await this.achievementInput.waitFor({ state: 'visible' });
      await this.achievementInput.fill(achievement);
      await this.achievementInput.press('Enter');
    }
    console.log('added achievement');
  }


  async addSkill(skills){
    for (const skill of skills) {
      await this.skillInput.waitFor({ state: 'visible' });
      await this.skillInput.fill(skill);
      await this.skillInput.press('Enter');
    }
    console.log('added skill');
  }


  async saveChanges() {
    await this.saveButton.waitFor({ state: 'visible' });
    await this.saveButton.click();
    console.log('Changes saved');
  }


  
  
}