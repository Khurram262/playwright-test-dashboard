import {expect} from '@playwright/test';
export class ShortlistCandidatePage {
  constructor(page) {
    this.page = page;
    this.viewApplicationButton = page.getByTestId('view-applications-button');
    this.viewDetailsButton = page.locator('[data-testid^="application-card-view-details-"]').first();
    this.changeStatusButton = page.getByTestId('application-update-status-trigger');
    this.shortListedButton = page.getByRole('button', { name: '⭐Shortlisted' });
    this.rejectButton = page.getByRole('button', { name: '❌Rejected' });
    this.saveButton = page.getByTestId('application-update-status-submit');
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
    
  async clickViewApplications() {
    await this.viewApplicationButton.waitFor({ state: 'visible' });
    await this.viewApplicationButton.click();
    console.log('Applications opened');
  }
  async clickViewDetails() {
    await this.viewDetailsButton.waitFor({ state: 'visible' });
    await this.viewDetailsButton.click();
    console.log('Candidate details opened');
  }
  async updateStatus() {
    await this.changeStatusButton.waitFor({ state: 'visible' });
    await this.changeStatusButton.click();
    console.log('Status updated'); 
  }
  async clickShortListed() {
    await this.shortListedButton.waitFor({ state: 'visible' });
    await this.shortListedButton.click();
    console.log('Shortlisted');
  }
  async clickSave() {
    await this.saveButton.waitFor({ state: 'visible' });
    await this.saveButton.click();
    console.log('Status saved');
  }
  
  async clickReject() {
    await this.rejectButton.waitFor({ state: 'visible' });
    await this.rejectButton.click();
    console.log('changed status to Rejected');
  }
}