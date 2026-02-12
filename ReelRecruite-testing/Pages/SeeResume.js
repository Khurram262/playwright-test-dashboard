import {expect} from '@playwright/test';
export class SeeResumePage {
  constructor(page) {
    this.page = page;

    this.viewApplicationButton = page.getByTestId('view-applications-button');
    this.viewDetailsButton = page.getByTestId('application-card-view-details-3c12b014-f16c-43bd-abc2-3d1535620620').first();
    this.viewProfileButton = page.getByTestId('application-view-profile-button');
    this.ResumeSection = page.getByTestId('resume-section');
    this.clickViewResumeButton = page.getByTestId('view-resume-card');
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
    
  async navigateToApplications() {
    await this.viewApplicationButton.waitFor({ state: 'visible' });
    await this.viewApplicationButton.click();
    console.log('Applications opened');
  }
    async viewCandidateDetails() {  
    await this.viewDetailsButton.waitFor({ state: 'visible' });
    await this.viewDetailsButton.click();
    console.log('Candidate details opened');
  }
    async viewCandidateProfile() {  
    await this.viewProfileButton.waitFor({ state: 'visible' });
    await this.viewProfileButton.click();
    console.log('Candidate profile opened');
  }
  async navigateToResumeSection() {
    await this.ResumeSection.waitFor({ state: 'visible' });
    await this.ResumeSection.scrollIntoViewIfNeeded();
    console.log('Scrolled to Resume section');
  }
  async clickViewResume() {
    await this.clickViewResumeButton.waitFor({ state: 'visible' });
    await this.clickViewResumeButton.click();
    await this.page.waitForTimeout(5000);
    console.log('Resume opened');
  }

 

}
