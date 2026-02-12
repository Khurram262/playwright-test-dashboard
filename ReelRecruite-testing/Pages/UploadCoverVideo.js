import { getVideoPath } from '../support/resume.helper.js';
export class UpdateCoverVideoResumePage {
  constructor(page) {
    this.page = page;


    this.profileMenu = page.getByTestId('navbar-user-menu-trigger').first();
    this.profileButton = page.getByTestId('navbar-user-menu-item-profile').first();
    this.coverVideoSection = page.getByTestId('video-resume-header');
    this.removeVideoButton = page.getByRole('button', { name: 'Remove Video Resume' }).last();
    this.okButton = page.getByRole('button', { name: 'Ok' });
    this.maybeLaterButton = page.getByRole('button', { name: 'Maybe Later' });
    this.uploadVideoInput = page.getByTestId('upload-video-label');
  }

  async handleMaybeLaterIfPresent() {
    try {
      await this.maybeLaterButton.waitFor({ state: 'visible', timeout: 2000 });
      await this.maybeLaterButton.click();
      await this.maybeLaterButton.waitFor({ state: 'hidden', timeout: 2000 });
    } catch { }
  }

  async clickProfile() {
    await this.profileMenu.waitFor({ state: 'visible' });
    await this.profileMenu.click();
    console.log('Profile button clicked');
  }

  async openProfile() {
    await this.profileButton.waitFor({ state: 'visible' });
    await this.profileButton.click();
    await this.page.waitForLoadState('domcontentloaded');
    console.log('Navigated to Profile page');
  }

  async navigateToCoverVideoSection() {
    await this.coverVideoSection.waitFor({ state: 'visible' });
    await this.coverVideoSection.scrollIntoViewIfNeeded();
    console.log('Cover video section opened');
  }

  async removeVideoIfExists() {
    await this.handleMaybeLaterIfPresent();

    if (await this.uploadVideoInput.isVisible()) {
      console.log('No existing video to delete - upload button is visible');
      return;
    }

    if (await this.removeVideoButton.isVisible()) {
      await this.removeVideoButton.waitFor({ state: 'visible' });
      await this.removeVideoButton.click();
      console.log('Clicked Remove Video Resume button');
      await this.okButton.waitFor({ state: 'visible', timeout: 5000 });
      await this.okButton.click();
      console.log('Clicked Ok on confirmation dialog');
      await this.uploadVideoInput.waitFor({ state: 'visible', timeout: 10000 });
      console.log('Video removed successfully - upload button is now visible');

      await this.handleMaybeLaterIfPresent();
    }
  }


  async uploadVideo(filename = 'small-video.mp4') {
    await this.handleMaybeLaterIfPresent();

    const videoPath = getVideoPath(filename);

    console.log(`Starting video upload: ${filename}`);
    const videoInput = this.page.getByTestId('video-resume-file-input');

    await videoInput.setInputFiles(videoPath);
    console.log(`Successfully set file: ${videoPath}. Waiting for upload to complete...`);
   
    await this.removeVideoButton.waitFor({ state: 'visible', timeout: 60000 });
    console.log('Upload completed: Remove Video button is now visible');    

    console.log('Video upload completed successfully');
  }
}
