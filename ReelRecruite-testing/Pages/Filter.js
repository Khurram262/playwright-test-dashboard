import {expect} from '@playwright/test';
export class FilterPage {
  constructor(page) {
    this.page = page;

    this.filtersButton = page.getByTestId('navbar-filters-button');
    this.jobTypeSelect = page.getByTestId('job-filter-jobType-select');
    this.workTypeSelect = page.getByTestId('job-filter-workType-select');
    this.experienceLevelSelect = page.getByTestId('job-filter-experienceLevel-select');
    this.regionSelect = page.getByTestId('job-filter-region-select');
    this.currencySelect = page.getByTestId('job-filter-currency-select');
    this.applyFiltersButton = page.getByTestId('job-filter-apply-button');
    this.removeFiltersButton = page.getByTestId('job-filter-remove-all-button');
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

  
  async openFilters() {
    await this.filtersButton.waitFor({ state: 'visible' });
    await this.filtersButton.click();
    console.log('Filters opened');
  }

  async selectRandomOption(selectLocator) {
    await selectLocator.waitFor({ state: 'visible' });

    const options = await selectLocator.locator('option').all();
    if (options.length <= 1) return;

    // Skip "All" option
    const randomIndex = Math.floor(Math.random() * (options.length - 1)) + 1;
    const value = await options[randomIndex].getAttribute('value');

    await selectLocator.selectOption(value);
    console.log(`Selected option: ${value}`);
  }

  async applyFilters() {
    await this.applyFiltersButton.waitFor({ state: 'visible' });
    await this.applyFiltersButton.click();
    await this.page.waitForLoadState('networkidle');
    console.log('Filters applied');
  }

  // ======================
  // Individual filters
  // ======================

  async applyJobTypeFilter() {
    await this.openFilters();
    await this.selectRandomOption(this.jobTypeSelect);
    await this.applyFilters();
    console.log('Job type filter applied');
  }

  async applyWorkTypeFilter() {
    await this.openFilters();
    await this.selectRandomOption(this.workTypeSelect);
    await this.applyFilters();
    console.log('Work type filter applied');
  }

  async applyExperienceLevelFilter() {
    await this.openFilters();
    await this.selectRandomOption(this.experienceLevelSelect);
    await this.applyFilters();
    console.log('Experience level filter applied');
  }

  async applyRegionFilter() {
    await this.openFilters();
    await this.selectRandomOption(this.regionSelect);
    await this.applyFilters();
    console.log('Region filter applied');
  }

  async applyCurrencyFilter() {
    await this.openFilters();
    await this.selectRandomOption(this.currencySelect);
    await this.applyFilters();
    console.log('Currency filter applied');
  }

  async applyAllFilters() {
    await this.openFilters();
    await this.selectRandomOption(this.jobTypeSelect);
    await this.selectRandomOption(this.workTypeSelect);
    await this.selectRandomOption(this.experienceLevelSelect);
    await this.selectRandomOption(this.regionSelect);
    await this.selectRandomOption(this.currencySelect);
    await this.applyFilters();
    console.log('All filters applied');
  }
}

export default FilterPage;
