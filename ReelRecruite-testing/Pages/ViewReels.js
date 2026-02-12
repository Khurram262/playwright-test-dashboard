export class ViewReelsPage {
    constructor(page) {
        this.page = page;
        this.viewReelsButton = page.getByTestId('view-reels-button');
        this.scrollLocator = page.getByTestId('job-reels-nav-down');
    }

    async navigateToViewReels() {
        await this.viewReelsButton.waitFor({ state: 'visible' });
        await this.viewReelsButton.click();
        console.log('Navigated to View Reels page');
    }

    async scrollToReel() {
        await this.scrollLocator.waitFor({ state: 'visible' });
        await this.scrollLocator.click();
        console.log('Scrolled to reel');
    }
}
