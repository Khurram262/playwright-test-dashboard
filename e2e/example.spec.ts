import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright Report Exporter/);
});

test('can upload a report', async ({ page }) => {
  await page.goto('/');

  // Expect the initial state to show "No test runs found".
  await expect(page.getByText('No test runs found')).toBeVisible();
});
