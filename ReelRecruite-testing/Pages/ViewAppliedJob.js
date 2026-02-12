import {expect} from '@playwright/test';
export class viewAppliedJobPage {
        constructor(page) {
            this.page = page;
            this.viewAppliedJobsButton = page.getByTestId('navbar-nav-item-applications');
            this.maybeLaterButton = page.getByRole('button', { name: 'Maybe Later' });
        }
        async handleMaybeLaterIfPresent() {
        try {
            await this.maybeLaterButton.waitFor({state: 'visible'});
            await this.maybeLaterButton.click();
            await this.maybeLaterButton.waitFor({state: 'hidden'});
        } catch {
            
        }
    } 
        async clickViewAppliedJobs() {  
            await this.viewAppliedJobsButton.click();
            console.log('Navigated to View Applied Jobs page');
        }
}