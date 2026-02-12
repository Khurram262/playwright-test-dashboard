import {expect} from '@playwright/test';
export class SaveDraft {
  constructor(page) {
    this.page = page;
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.postNewJobButton = page.getByRole('button', { name: 'Post New Job' });
    this.titleInput = page.getByTestId('job-title-input');
    this.summaryInput = page.getByTestId('job-highlight-textarea');
    this.regionInput = page.getByTestId('job-region-input');
    this.saveDraftButton = page.getByTestId('undefined-action-wrapper');
    this.draftSavedMessage = page.getByText('Draft saved successfully');
  }
   async Cancel() {
    await this.cancelButton.click();
  }
  

   async clickIfVisible(locator) {
  if (!locator) {
    return false;
  }

  try {
    if (await locator.isVisible()) {
      await locator.click();
      return true;
    }
  } catch {
  }

  return false;
}


async postJob () {
    await this.clickIfVisible(this.cancelButton);
    await this.postNewJobButton.waitFor({ state: 'visible'});
    await this.postNewJobButton.click();
    console.log('Job form opened');
  }
  
async fillBasicInfo() {
    await this.titleInput.fill('Software Quality Assurance Engineer');
    await this.summaryInput.fill('We are looking for a detail-oriented Software Quality Assurance Engineer to join our dynamic team. The ideal candidate will have experience in manual and automated testing, a keen eye for detail, and a passion for ensuring software quality.');
    await this.regionInput.fill('North America');
    console.log('Job details filled');
  }

    async saveDraft() {
    await this.saveDraftButton.waitFor({ state: 'visible'});
    await this.saveDraftButton.click();
    console.log('Draft saved');
  }

}