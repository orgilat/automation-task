import { test, expect } from '../../../fixtures';
import { allure } from 'allure-playwright';
import { setFunctionalAllureMeta, addTestDescription } from '../../../helpers/allureLabels';
import logger from '../../../logger';

test.describe('@categories Categories', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('domcontentloaded');
    
    setFunctionalAllureMeta({
      layer: 'e2e',
      suite: 'Notes',
      subSuite: 'Categories',
      component: 'Sidebar',
      severity: 'normal',
    });
  });

  test('Create a category appears in sidebar', async ({ page, sidebarPage }) => {
    addTestDescription({
      whatIsTested: 'A created category appears in the sidebar.',
      testSteps: ['Create category "Work"', 'Verify category visible in sidebar'],
    });

    await allure.step('Create category', async () => {
      await sidebarPage.createCategory('Work');
    });

    await allure.step('Verify category appears', async () => {
      await expect(page.getByText('Work')).toBeVisible();
    });

    logger.info('Category creation test completed');
  });

  test('Create multiple categories independently', async ({ page, sidebarPage }) => {
    addTestDescription({
      whatIsTested: 'Multiple categories can be created independently.',
      testSteps: ['Create "Work" category', 'Create "Personal" category', 'Verify both visible'],
    });

    await allure.step('Create Work category', async () => {
      await sidebarPage.createCategory('Work');
    });

    await allure.step('Create Personal category', async () => {
      await sidebarPage.createCategory('Personal');
    });

    await allure.step('Verify both categories visible', async () => {
      await expect(page.getByText('Work')).toBeVisible();
      await expect(page.getByText('Personal')).toBeVisible();
    });

    logger.info('Multiple categories test completed');
  });

  test('Category input closes after submission', async ({ page, sidebarPage }) => {
    addTestDescription({
      whatIsTested: 'Category input field closes after submitting a new category.',
      testSteps: ['Open category input', 'Verify input visible', 'Submit category', 'Verify input hidden'],
    });

    await allure.step('Open category input', async () => {
      await sidebarPage.addCategoryButton.click();
    });

    await allure.step('Verify input is visible', async () => {
      await expect(sidebarPage.newCategoryInput).toBeVisible();
    });

    await allure.step('Type and submit category', async () => {
      await sidebarPage.newCategoryInput.fill('Work');
      await sidebarPage.newCategoryInput.press('Enter');
    });

    await allure.step('Verify input is hidden', async () => {
      await expect(sidebarPage.newCategoryInput).not.toBeVisible();
    });

    logger.info('Category input close test completed');
  });
});
