import { test, expect } from '../../../fixtures';
import { allure } from 'allure-playwright';
import { setFunctionalAllureMeta, addTestDescription } from '../../../helpers/allureLabels';
import logger from '../../../logger';

test.describe('@favorites Favorites', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('domcontentloaded');
    
    setFunctionalAllureMeta({
      layer: 'e2e',
      suite: 'Notes',
      subSuite: 'Favorites',
      component: 'Sidebar',
      severity: 'critical',
    });
  });

  test('Favorite via toolbar appears in Favorites', async ({ page, sidebarPage, editorPage, noteListPage }) => {
    addTestDescription({
      whatIsTested: 'A note favorited via toolbar appears in the Favorites section.',
      testSteps: ['Create note', 'Click favorite button', 'Navigate to Favorites', 'Verify note present'],
    });

    await allure.step('Create a new note', async () => {
      await sidebarPage.createNote();
      await noteListPage.selectNoteAt(0);
    });

    await allure.step('Favorite note via toolbar', async () => {
      await editorPage.toggleFavorite();
    });

    await allure.step('Navigate to Favorites', async () => {
      await sidebarPage.goToFavorites();
    });

    await allure.step('Verify note in Favorites', async () => {
      const count = await noteListPage.getNoteCount();
      expect(count).toBe(1);
    });

    logger.info('Favorite via toolbar test completed');
  });

  test('Only favorited note appears in Favorites', async ({ page, sidebarPage, editorPage, noteListPage }) => {
    addTestDescription({
      whatIsTested: 'Only favorited notes appear in the Favorites section.',
      testSteps: ['Create 2 notes', 'Favorite only first', 'Navigate to Favorites', 'Verify count is 1'],
    });

    await allure.step('Create first note', async () => {
      await sidebarPage.createNote();
    });

    await allure.step('Create second note', async () => {
      await sidebarPage.createNote();
    });

    await allure.step('Favorite only first note', async () => {
      await noteListPage.selectNoteAt(0);
      await editorPage.toggleFavorite();
    });

    await allure.step('Navigate to Favorites', async () => {
      await sidebarPage.goToFavorites();
    });

    await allure.step('Verify only one note in Favorites', async () => {
      const count = await noteListPage.getNoteCount();
      expect(count).toBe(1);
    });

    logger.info('Single favorite test completed');
  });

  test('Un-favorite removes note from Favorites', async ({ page, sidebarPage, editorPage, noteListPage }) => {
    addTestDescription({
      whatIsTested: 'Un-favoriting a note removes it from Favorites.',
      testSteps: ['Create note', 'Favorite it', 'Navigate to Favorites', 'Un-favorite', 'Verify removed'],
    });

    await allure.step('Create a new note', async () => {
      await sidebarPage.createNote();
      await noteListPage.selectNoteAt(0);
    });

    await allure.step('Favorite note', async () => {
      await editorPage.toggleFavorite();
    });

    await allure.step('Navigate to Favorites', async () => {
      await sidebarPage.goToFavorites();
    });

    await allure.step('Un-favorite note', async () => {
      await noteListPage.selectNoteAt(0);
      await editorPage.toggleFavorite();
    });

    await allure.step('Verify note removed from Favorites', async () => {
      const count = await noteListPage.getNoteCount();
      expect(count).toBe(0);
    });

    logger.info('Un-favorite test completed');
  });
});
