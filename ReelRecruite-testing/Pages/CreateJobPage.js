import { expect } from '@playwright/test';
import { storeJobId } from '../support/job.helper.js';

export class CreateJobPage {
  constructor(page) {
    this.page = page;
    this.createdJobId = null;
    this.postNewJobButton = page.getByTestId('post-new-job-button'); 
    this.nextButton = page.getByTestId('next-step-button'); 

    this.titleInput = page.getByTestId('job-title-input');
    this.summaryInput = page.getByTestId('job-highlight-textarea');
    this.generateHighlightButton = page.getByTestId('generate-highlight-ai-button');
    this.generateInput = page.getByTestId('ai-prompt-textarea');
    this.confirmGenerateButton = page.getByTestId('ai-generate-button');
    this.applyAiButton = page.getByTestId('ai-apply-generated-button');
    this.generatedescriptionbutton = page.getByTestId('generate-description-ai-button');
    this.regionInput = page.getByTestId('job-region-input');
    this.locationInput = page.getByTestId('job-location-input');
    this.jobTypeDropdown = page.getByTestId('job-type-dropdown');
    this.workTypeDropdown = page.getByTestId('work-type-dropdown');
    this.experienceDropdown = page.getByTestId('experience-level-dropdown');
    this.salaryInput = page.getByTestId('salary-range-input');
    this.currencySelectControl = page.getByTestId('currency-dropdown');
    this.addQuestionButton = page.getByTestId('add-question-button');
    this.questionBox = page.getByTestId('question-input-0');
    this.questionBox2 = page.getByTestId('question-input-1');
    this.requiredCheckbox = page.getByTestId('question-required-checkbox-0');
    this.questionType = page.getByTestId('question-type-select-1');

    this.previewButton = page.getByTestId('preview-step-button');
    this.seeAllButton = page.getByTestId('candidate-count-see-all-button');
    this.confirmPostButton = page.getByTestId('publish-job-button');
  }

  // async handleCancelIfPresent() {
  //   if (await this.cancelButton.isVisible()) {
  //     await expect(this.cancelButton).toBeVisible();
  //     await this.cancelButton.click();
  //     await expect(this.cancelButton).toBeHidden();
  //   }
  //   console.log('Handled Cancel if present');
  // }

    async openJobForm() {
    await this.postNewJobButton.waitFor({ state: 'visible' });
    await this.postNewJobButton.click();
    await this.titleInput.waitFor({ state: 'visible' });
    console.log('Job form opened');
}

 async fillTitle(title){
  await this.titleInput.waitFor({ state: 'visible' });
  await this.titleInput.fill(title);
  console.log('Title filled');
 }

 async generateHighlight(){
  await this.generateHighlightButton.waitFor({ state: 'visible' });
  await this.generateHighlightButton.click();
  await this.generateInput.waitFor({ state: 'visible' });
  await this.generateInput.fill('React developer');
  await this.confirmGenerateButton.waitFor({ state: 'visible' });
  await this.confirmGenerateButton.click();
  await this.applyAiButton.waitFor({ state: 'visible' });
  await this.applyAiButton.click();
  console.log('Highlight generated');
 }
 async addRegionAndLocation(region,location){
  await this.regionInput.waitFor({ state: 'visible' });
  await this.regionInput.fill(region);
  await this.locationInput.waitFor({ state: 'visible' });
  await this.locationInput.fill(location);
  await this.nextButton.click();
  console.log('Region and location added');
 }

  async fillJobTypeAndCompensation(){
    await this.jobTypeDropdown.waitFor({ state: 'visible' });
    await this.jobTypeDropdown.click();
    await this.page.getByRole('option', { name: 'Internship' }).click();
    await this.workTypeDropdown.waitFor({ state: 'visible' });
    await this.workTypeDropdown.click();
    await this.page.getByRole('option', { name: 'On-site' }).click();
    await this.experienceDropdown.waitFor({ state: 'visible' });
    await this.experienceDropdown.click();
    await this.page.getByRole('option', { name: 'Executive' }).click();
    await this.salaryInput.fill('50000-70000');
    await this.currencySelectControl.click();
    await this.page.getByRole('option', { name: 'pkr (₨)' }).click();

    await this.nextButton.click();
    console.log('Job type and compensation filled');
  }

  async fillJobDescription() {
    await this.generatedescriptionbutton.click();
    await this.generateInput.waitFor({ state: 'visible' });
    await this.generateInput.fill('React developer');
    await this.confirmGenerateButton.waitFor({ state: 'visible' });
    await this.confirmGenerateButton.click();
    await this.applyAiButton.waitFor({ state: 'visible' });
    await this.applyAiButton.click();
    await this.nextButton.click();
    console.log('Job description filled');
  }

  async clickNext(){
    await this.nextButton.waitFor({ state: 'visible' });
    await this.nextButton.click();
    console.log('Next button clicked');
  }

  async addQuestions() {
    await this.addQuestionButton.click();
    await this.questionBox.fill('How many years of experience do you have?');
    await this.requiredCheckbox.check();

    await this.addQuestionButton.click();
    await this.questionBox2.fill('Are you a CS graduate?');
    await this.questionType.selectOption('boolean');
    console.log('Questions added');
  }

  async previewJob() {
    await this.previewButton.click();
    console.log('Preview job clicked');
  }

  async submitJob() {
  await this.confirmPostButton.waitFor({ state: 'visible' });
  await expect(this.confirmPostButton).toBeEnabled();

  const jobRequestPromise = this.page.waitForRequest(req =>
    req.method() === 'POST' &&
    req.url() === 'https://recruitai-backend-production.up.railway.app/v1/jobs/create'
  );

  await this.confirmPostButton.click();

  const jobRequest = await jobRequestPromise;
  const response = await jobRequest.response();

  if (!response) {
    throw new Error('No response returned from job create API');
  }

  const responseBody = await response.json();

  console.log('JOB CREATE RESPONSE:', responseBody);

  this.createdJobId = responseBody?.job?.id;

  if (!this.createdJobId) {
    throw new Error(`Job ID missing: ${JSON.stringify(responseBody)}`);
  }

  storeJobId(this.createdJobId);

  console.log('Job stored successfully:', this.createdJobId);

  return this.createdJobId;
}


  async seeAllApplications() {
    await this.seeAllButton.click();
    console.log('See all applications clicked');
  }

  async generateSummaryWithAI() {
    await this.generateWithAIButton.click();
    console.log('Generate with AI button clicked for summary');
  }

  async applyGeneratedSummary() {
    await this.applyButton.click();
    console.log('Applied generated summary');
  }

  async generateDescriptionWithAI() {
    await this.generateWithAIButton.click();
    console.log('Generate with AI button clicked for description');
  }

  async applyGeneratedDescription() {
    await this.applyButton.click();
    console.log('Applied generated description');
  }

  async closeAIModal() {
    await this.closeButton.click();
    console.log('Closed AI modal');
  }

  async fillAIPrompt(prompt) {
    await this.aiPromptTextarea.fill(prompt);
    console.log(`Filled AI prompt: ${prompt}`);
  }

  async generateWithPrompt(prompt) {
    await this.fillAIPrompt(prompt);
    await Promise.all([
      this.page.waitForLoadState('networkidle', { timeout: 30000 }),
      this.generateButton.click()
    ]);
    console.log('Generated content with AI prompt');
    await this.page.waitForLoadState('networkidle', { timeout: 30000 });
  }
}
