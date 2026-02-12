import {expect} from '@playwright/test';

export class UpdateSkillsPage {
    constructor(page) {
      this.page = page;

      this.profileMenu = page.getByTestId('navbar-user-menu-trigger').first();
      this.ProfileButton = page.getByTestId('navbar-user-menu-item-profile').first();
      this.editSkillsButton = page.getByTestId('edit-skills-button');
      this.skillsTextbox = page.getByTestId('skills-input-field');
      this.saveChangesButton = page.getByTestId('skills-save-button');
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
            
        }
    }
  
    async clickProfile() {
      await this.profileMenu.waitFor({ state: 'visible', timeout: 10000 });
      await this.profileMenu.click();
      console.log('Profile button clicked');
    }
  
    async openProfile() {
      await this.ProfileButton.waitFor({ state: 'visible' });
      await this.page.waitForLoadState('networkidle');
      await this.ProfileButton.click();
      console.log('Navigated to Profile page');
    }
  
  
    async clickEditSkills() {
      await this.editSkillsButton.click({ force: true });
      await this.skillsTextbox.waitFor({ state: 'visible' });
      console.log('Edit Skills button clicked');
    }
  
    async addSkill(skill) {
      await this.skillsTextbox.waitFor({ state: 'visible' });
      await this.skillsTextbox.fill(skill);
      await this.skillsTextbox.press('Enter');
      
    }
  
    
    async addSkills(skills) {
      for (const skill of skills) {
        await this.addSkill(skill);
      }
      console.log('Skills added');
    }
  
    async clickSaveChanges() {
      await this.saveChangesButton.waitFor({ state: 'visible' });
      await this.saveChangesButton.click();
      await this.page.waitForLoadState('networkidle');
      console.log('Changes saved');
    }
  
  
    async updateSkills(skills) {
      await this.clickEditSkills();
      if (Array.isArray(skills)) {
        await this.addSkills(skills);
      } else {
        await this.addSkill(skills);
      }
      await this.clickSaveChanges();
    }
  }
  
  export default UpdateSkillsPage;