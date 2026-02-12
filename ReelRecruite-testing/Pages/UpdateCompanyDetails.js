
import { getBannerImagePath } from '../support/profileMedia.helper';
export class CompanyDetailsPage{
    constructor(page) {
        this.page = page;

       this.profileMenu = page.getByTestId('navbar-user-menu-trigger').first();
       this.ProfileButton = page.getByTestId('navbar-user-menu-item-profile').first();
       this.companyDetailsSection = page.getByTestId('company-profile-section');
       this.EditDetailsButton = page.getByTestId('edit-company-profile-button');
       this.addLogoButton = page.getByTestId('company-logo-upload-button');
       this.companyNameInput = page.locator('#companyName');
       this.TagLineInput = page.locator('#tagline');
       this.descriptionInput = page.locator('#description');
       this.industryInput = page.locator('#industry');
       this.companySizeInput = page.locator('#companySize');
       this.locationInput = page.locator('#headquarters');
       this.companylocationInput = page.getByTestId('company-locations-multi-input');
       this.websiteInput = page.locator('#website');
       this.LinkedInInput = page.locator('#linkedinUrl');
       this.twitterInput = page.locator('#twitterUrl');
       this.FacebookInput = page.locator('#facebookUrl');
       this.contactEmailInput = page.locator('#contactEmail');
       this.contactNumberInput = page.locator('#contactPhone');
       this.saveButton = page.getByTestId('company-save-changes-button');
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

     async openProfileMenu() {
        await this.profileMenu.waitFor({ state: 'visible' });
        await this.profileMenu.click();
        await this.page.waitForLoadState('networkidle');
        console.log('Navigated to Profile page');
     }

        async navigateToProfile() {
            await this.ProfileButton.waitFor({ state: 'visible' });
            await this.ProfileButton.click();
            await this.page.waitForLoadState('networkidle');
            console.log('Navigated to Profile page');
        }
        async navigateToCompanyDetails() {
            await this.companyDetailsSection.waitFor({ state: 'visible' });
            await this.companyDetailsSection.scrollIntoViewIfNeeded();
            console.log('Scrolled to Company Details section');
        }
        async clickEditDetails() {
            await this.EditDetailsButton.first().waitFor({ state: 'visible' });
            await this.EditDetailsButton.first().click();
            console.log('Edit details button clicked');
        }
        async updateCompanyLogo() {
            const bannerPath = getBannerImagePath();
            await this.page.locator('input[type="file"]').setInputFiles(bannerPath);
            await this.page.locator('input[type="file"]').evaluate(input =>
            input.dispatchEvent(new Event('change', { bubbles: true }))
            );
            console.log('Company logo updated');
        }
        async clearAndTypeUsingKeyboard(locator, value) {
            await locator.waitFor({ state: 'visible' });
            await locator.click();
            await locator.press('Control+A'); // use 'Meta+A' for Mac if needed
            await locator.press('Backspace');
            await locator.type(value);
  }
        async updateCompanyName(newText) {
             await this.clearAndTypeUsingKeyboard(this.companyNameInput, newText);
             console.log('Company name updated');
        }
        async updateTagLine(newText) {
             await this.clearAndTypeUsingKeyboard(this.TagLineInput, newText);
             console.log('Tagline updated');
        }
        async updateDescription(newText) {
             await this.clearAndTypeUsingKeyboard(this.descriptionInput, newText);
             console.log('Description updated');
        }
        async updateIndustry(newText) {
             await this.clearAndTypeUsingKeyboard(this.industryInput, newText);
             console.log('Industry updated');
        }
        async updateCompanySize(newText) {
                await this.clearAndTypeUsingKeyboard(this.companySizeInput, newText);
                console.log('Company size updated');
        }
        async updateLocation(newText) {
                await this.clearAndTypeUsingKeyboard(this.locationInput, newText);
                console.log('Location updated');
        }
        async updateCompanyLocation(newText){
            await this.clearAndTypeUsingKeyboard(this.companylocationInput, newText);
            await this.companylocationInput.press('Enter');
            console.log('Company location updated');
        }
        async updateWebsite(newText) {
                await this.clearAndTypeUsingKeyboard(this.websiteInput, newText);
                console.log('Website updated');
        }
        async updateLinkedIn(newText) {
                await this.clearAndTypeUsingKeyboard(this.LinkedInInput, newText);
                console.log('LinkedIn updated');
        }
        async updateTwitter(newText) {
                await this.clearAndTypeUsingKeyboard(this.twitterInput, newText);
                console.log('Twitter updated');
        }
        async updateFacebook(newText) {
                await this.clearAndTypeUsingKeyboard(this.FacebookInput, newText);
                console.log('Facebook updated');
        }
        async updateContactEmail(newText) {
                await this.clearAndTypeUsingKeyboard(this.contactEmailInput, newText);
                console.log('Contact email updated');
        }
        async updateContactNumber(newText) {
                await this.clearAndTypeUsingKeyboard(this.contactNumberInput, newText);
                console.log('Contact number updated');
        }
        async clickSaveChanges() {
            await this.saveButton.waitFor({ state: 'visible' });
            await this.saveButton.click();
            console.log('Changes saved');
        }





}