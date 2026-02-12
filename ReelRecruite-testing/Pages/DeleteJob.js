
export class deleteJobPage{
    constructor(page) { 
        this.page = page;
        this.deleteJobButton = page.getByTestId('job-delete-button').first();
        this.confirmDeleteButton = page.getByRole('button', { name: 'Ok' });
    }
    async deleteJob() {
        await this.deleteJobButton.waitFor({ state: 'visible' });
        await this.deleteJobButton.click();
        
    }
    async confirmDelete() {
        await this.confirmDeleteButton.waitFor({ state: 'visible' });
        await this.confirmDeleteButton.click();
        console.log('Job deleted.');
    }   
}