import { test, expect } from '../../../fixtures';
import { allure } from 'allure-playwright';
import { setFunctionalAllureMeta, addTestDescription } from '../../../helpers/allureLabels';
import logger from '../../../logger';

test.describe('@settings Settings', () => {
  test.beforeEach(async ({ page }) => {
     await page.goto('/app');
    await page.waitForLoadState('domcontentloaded');
    
    setFunctionalAllureMeta({
      layer: 'e2e',
      suite: 'Notes',
      subSuite: 'Settings',
      component: 'SettingsPage',
      severity: 'normal',
    });
  });

  test('Settings panel opens', async ({ page, editorPage, settingsPage }) => {
    addTestDescription({
      whatIsTested: 'Settings panel opens when clicking the settings button.',
      testSteps: ['Click settings button', 'Verify Preferences tab visible'],
    });

    await allure.step('Open settings', async () => {
      await editorPage.openSettings();
    });

    await allure.step('Verify settings panel visible', async () => {
      await expect(settingsPage.preferencesTab).toBeVisible();
    });

    logger.info('Settings panel open test completed');
  });

  test('Data tab shows Download and Export buttons', async ({ page, editorPage, settingsPage }) => {
    addTestDescription({
      whatIsTested: 'Data management tab displays Download and Export buttons.',
      testSteps: ['Open settings', 'Navigate to Data management', 'Verify buttons visible'],
    });

    await allure.step('Open settings', async () => {
      await editorPage.openSettings();
    });

    await allure.step('Navigate to Data management tab', async () => {
      await settingsPage.dataManagementTab.click();
    });

    await allure.step('Verify Download and Export buttons visible', async () => {
      await expect(settingsPage.downloadAllButton).toBeVisible();
      await expect(settingsPage.exportBackupButton).toBeVisible();
    });

    logger.info('Data tab buttons test completed');
  });

  test('Markdown preview toggle is interactive', async ({ page, editorPage, settingsPage }) => {
    addTestDescription({
      whatIsTested: 'Markdown preview toggle can be clicked without error.',
      testSteps: ['Open settings', 'Verify toggle visible', 'Click toggle', 'Verify still visible'],
    });

    await allure.step('Open settings', async () => {
      await editorPage.openSettings();
    });

    await allure.step('Verify toggle is visible', async () => {
      await expect(settingsPage.markdownPreviewToggle).toBeVisible();
    });

    await allure.step('Click toggle', async () => {
      await settingsPage.markdownPreviewToggle.click();
    });

    await allure.step('Verify toggle still visible', async () => {
      await expect(settingsPage.markdownPreviewToggle).toBeVisible();
    });

    logger.info('Markdown preview toggle test completed');
  });

  test('Dark mode toggle is interactive', async ({ page, editorPage, settingsPage }) => {
    addTestDescription({
      whatIsTested: 'Dark mode toggle can be clicked without error.',
      testSteps: ['Open settings', 'Verify toggle visible', 'Click toggle', 'Verify still visible'],
    });

    await allure.step('Open settings', async () => {
      await editorPage.openSettings();
    });

    await allure.step('Verify toggle is visible', async () => {
      await expect(settingsPage.darkModeToggle).toBeVisible();
    });

    await allure.step('Click toggle', async () => {
      await settingsPage.darkModeToggle.click();
    });

    await allure.step('Verify toggle still visible', async () => {
      await expect(settingsPage.darkModeToggle).toBeVisible();
    });

    logger.info('Dark mode toggle test completed');
  });
});
