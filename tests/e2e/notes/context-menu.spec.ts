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

  test('Three-dots menu opens on click', async ({ sidebarPage, noteListPage, contextMenuPage }) => {
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

  test('All 4 menu options are present', async ({ sidebarPage, noteListPage, contextMenuPage }) => {
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

  test('Move to trash via menu', async ({ sidebarPage, noteListPage, contextMenuPage }) => {
    addTestDescription({
      whatIsTested: 'A note can be moved to trash via context menu.',
      testSteps: ['Create note', 'Open menu', 'Move to trash', 'Navigate to Trash', 'Verify note present'],
    });

    await allure.step('Create a new note', async () => {
      await sidebarPage.createNote();
    });

    await allure.step('Open context menu and move to trash', async () => {
      await noteListPage.openNoteOptions(0);
      await contextMenuPage.moveToTrash();
    });

    await allure.step('Navigate to Trash', async () => {
      await sidebarPage.goToTrash();
    });

    await allure.step('Verify note is in trash', async () => {
      const count = await noteListPage.getNoteCount();
      expect(count).toBe(1);
    });

    logger.info('Move to trash via menu test completed');
  });

  test('Favorite via menu', async ({ sidebarPage, noteListPage, contextMenuPage }) => {
    addTestDescription({
      whatIsTested: 'A note can be marked as favorite via context menu.',
      testSteps: ['Create note', 'Open menu', 'Mark favorite', 'Navigate to Favorites', 'Verify note present'],
    });

    await allure.step('Create a new note', async () => {
      await sidebarPage.createNote();
    });

    await allure.step('Open context menu and mark favorite', async () => {
      await noteListPage.openNoteOptions(0);
      await contextMenuPage.favorite();
    });

    await allure.step('Navigate to Favorites', async () => {
      await sidebarPage.goToFavorites();
    });

    await allure.step('Verify note is in favorites', async () => {
      const count = await noteListPage.getNoteCount();
      expect(count).toBe(1);
    });

    logger.info('Favorite via menu test completed');
  });

  test('Menu closes after selecting an option', async ({ sidebarPage, noteListPage, contextMenuPage }) => {
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
