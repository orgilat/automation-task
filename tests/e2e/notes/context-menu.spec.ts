import { test, expect } from '../../../fixtures';
import { allure } from 'allure-playwright';
import { setFunctionalAllureMeta, addTestDescription } from '../../../helpers/allureLabels';
import logger from '../../../logger';

test.describe('@notes Note context menu', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('domcontentloaded');
    
    setFunctionalAllureMeta({
      layer: 'e2e',
      suite: 'Notes',
      subSuite: 'Context Menu',
      component: 'ContextMenu',
      severity: 'critical',
    });
  });

  test('Three-dots menu opens on click', async ({ page, sidebarPage, noteListPage, contextMenuPage }) => {
    addTestDescription({
      whatIsTested: 'The three-dots context menu opens when clicked.',
      testSteps: ['Create note', 'Click three-dots button', 'Verify menu appears'],
    });

    await allure.step('Create a new note', async () => {
      await sidebarPage.createNote();
    });

    await allure.step('Open context menu', async () => {
      await noteListPage.openNoteOptions(0);
    });

    await allure.step('Verify menu is visible', async () => {
      await expect(contextMenuPage.favoriteOption).toBeVisible();
    });

    logger.info('Context menu open test completed');
  });

  test('All 4 menu options are present', async ({ page, sidebarPage, noteListPage, contextMenuPage }) => {
    addTestDescription({
      whatIsTested: 'All four context menu options are visible.',
      testSteps: ['Create note', 'Open menu', 'Verify all options visible'],
    });

    await allure.step('Create a new note', async () => {
      await sidebarPage.createNote();
    });

    await allure.step('Open context menu', async () => {
      await noteListPage.openNoteOptions(0);
    });

    await allure.step('Verify all menu options', async () => {
      await expect(contextMenuPage.favoriteOption).toBeVisible();
      await expect(contextMenuPage.trashOption).toBeVisible();
      await expect(contextMenuPage.downloadOption).toBeVisible();
      await expect(contextMenuPage.copyReferenceOption).toBeVisible();
    });

    logger.info('All menu options test completed');
  });

  test('Menu closes after selecting an option', async ({ page, sidebarPage, noteListPage, contextMenuPage }) => {
    addTestDescription({
      whatIsTested: 'Context menu closes after selecting an option.',
      testSteps: ['Create note', 'Open menu', 'Select option', 'Verify menu closed'],
    });

    await allure.step('Create a new note', async () => {
      await sidebarPage.createNote();
    });

    await allure.step('Open context menu and select option', async () => {
      await noteListPage.openNoteOptions(0);
      await contextMenuPage.moveToTrash();
    });

    await allure.step('Verify menu is closed', async () => {
      await expect(contextMenuPage.favoriteOption).not.toBeVisible();
    });

    logger.info('Menu closes test completed');
  });
});
