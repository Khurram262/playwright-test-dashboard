export class withdrawPage {
    constructor(page) {
        this.page = page;
        this.withdrawButton = page.getByRole('button', { name: 'Withdraw Application' })
         this.maybeLaterButton = page.getByRole('button', { name: 'Maybe Later' });
         this.confirmWithdrawButton = page.getByRole('button', { name: 'Ok' });
    }
    async handleMaybeLaterIfPresent() {
        try {
            await this.maybeLaterButton.waitFor({
                state: 'visible'
            });
            await this.maybeLaterButton.click();
            await this.maybeLaterButton.waitFor({ state: 'hidden' });
        } catch {
        }
    } 

    async withdraw () {
        await this.withdrawButton.waitFor({ state: 'visible' });
        await this.withdrawButton.click();
        console.log('Withdraw button clicked');
    }

    async confirmWithdraw () {
        await this.confirmWithdrawButton.waitFor({ state: 'visible' });
        await this.confirmWithdrawButton.click();
        console.log('Confirm withdraw button clicked');
    }

}