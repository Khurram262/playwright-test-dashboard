import {expect} from '@playwright/test';
export class SearchJob {
  constructor(page) {
    this.page = page;

    this.searchInput = page.getByTestId('navbar-job-search-input');
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
  
  async searchJob(keyword){
    await this.searchInput.waitFor({ state: 'visible' });
    await this.searchInput.fill(keyword);
    await this.searchInput.press('Enter');
    console.log('Job searched');
  }
}
