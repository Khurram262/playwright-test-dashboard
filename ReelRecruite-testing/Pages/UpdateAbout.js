import {expect} from '@playwright/test';
export class UpdateAboutPage {
    constructor(page) {
      this.page = page;
  
      this.profileMenu = page.getByTestId('navbar-user-menu-trigger').first();
      this.ProfileButton = page.getByTestId('navbar-user-menu-item-profile').first();
      this.editAboutButton = page.getByTestId('edit-about-button').first();
      this.bioTextbox = page.locator('#bio');
      this.countryTextbox = page.locator('#country');
      this.locationTextbox = page.locator('#location');
      this.saveChangesButton = page.getByTestId('about-save-button');
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
  async clickProfile() {
    await this.profileMenu.waitFor({ state: 'visible', timeout: 10000 });
    await this.profileMenu.click();
    console.log('Profile button clicked');
  }


  async openProfile() {
    await this.ProfileButton.waitFor({ state: 'visible' });
    await this.ProfileButton.click();
     await this.page.waitForLoadState('networkidle');
     console.log('Navigated to Profile page');
  }

  async clickEditAbout() {
    await this.editAboutButton.waitFor({ state: 'visible' });
    await this.editAboutButton.click();
    console.log('Edit About button clicked');
  }
   async clearAndTypeUsingKeyboard(locator, value) {
    await locator.waitFor({ state: 'visible' });
    await locator.click();
    await locator.press('Control+A');
    await locator.press('Backspace');
    await locator.type(value);
  }

  async updateBio(bio) {
    await this.clearAndTypeUsingKeyboard(this.bioTextbox, bio);
    console.log('Bio updated successfully');
  }
  
  async updateCountry(country) {
    await this.clearAndTypeUsingKeyboard(this.countryTextbox, country);
    console.log('Country updated successfully');
  }
 
  async updateLocation(location) {
    await this.clearAndTypeUsingKeyboard(this.locationTextbox, location);
    console.log('Location updated successfully',location);
  }

  async saveChanges() {
    await this.saveChangesButton.waitFor({ state: 'visible' });
    await this.saveChangesButton.click();
    console.log('Changes saved');
  }

}