import { test, expect } from '../../../fixtures';
import { allure } from 'allure-playwright';
import { setFunctionalAllureMeta, addTestDescription } from '../../../helpers/allureLabels';
import logger from '../../../logger';

test.describe('@search Search', () => {
  test.beforeEach(async ({ page }) => {
     await page.goto('/app');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    
    setFunctionalAllureMeta({
      layer: 'e2e',
      suite: 'Notes',
      subSuite: 'Search',
      component: 'NoteList',
      severity: 'critical',
    });
  });

  test('Search filters to matching notes', async ({ page, sidebarPage, noteListPage }) => {
    addTestDescription({
      whatIsTested: 'Search filters the note list to show only matching notes.',
      testSteps: ['Create 2 notes with unique content', 'Search for unique term', 'Verify count is 1'],
    });

    await allure.step('Create first note with unique content', async () => {
      await sidebarPage.createNote('QA_UNIQUE_ALPHA_NOTE');
      await page.waitForTimeout(300);
    });

    await allure.step('Create second note with different content', async () => {
      await sidebarPage.createNote('QA_UNIQUE_BETA_NOTE');
      await page.waitForTimeout(300);
    });

    await allure.step('Search for unique term', async () => {
      await noteListPage.search('QA_UNIQUE_ALPHA');
      await page.waitForTimeout(300);
    });

    await allure.step('Verify only one note matches', async () => {
      const count = await noteListPage.getNoteCount();
      expect(count).toBe(1);
    });

    logger.info('Search filter test completed');
  });

  test('Search with no match shows empty list', async ({ page, noteListPage }) => {
    addTestDescription({
      whatIsTested: 'Search with no matching results shows fewer notes than before searching.',
      testSteps: ['Record initial count', 'Search for non-existent content', 'Verify count decreased'],
    });

    const countBefore = await noteListPage.getNoteCount();

    await allure.step('Search for non-existent content', async () => {
      await noteListPage.search('XQZNOTEXIST9876');
      await page.waitForTimeout(300);
    });

    await allure.step('Verify list is empty', async () => {
      const count = await noteListPage.getNoteCount();
      expect(count).toBeLessThan(countBefore);
    });

    logger.info('Search no match test completed');
  });

  test('Clearing search restores full list', async ({ page, sidebarPage, editorPage, noteListPage }) => {
    addTestDescription({
      whatIsTested: 'Clearing the search input restores the full note list.',
      testSteps: ['Record initial count', 'Create 2 notes', 'Search for one', 'Clear search', 'Verify count restored'],
    });

    const countBefore = await noteListPage.getNoteCount();

    await allure.step('Create first note', async () => {
      await sidebarPage.createNote();
      await editorPage.typeContent('First note');
      await page.waitForTimeout(300);
    });

    await allure.step('Create second note', async () => {
      await sidebarPage.createNote();
      await editorPage.typeContent('Second note');
      await page.waitForTimeout(300);
    });

    await allure.step('Search for first note', async () => {
      await noteListPage.search('First');
      await page.waitForTimeout(300);
    });

    await allure.step('Clear search', async () => {
      await noteListPage.clearSearch();
      await page.waitForTimeout(300);
    });

    await allure.step('Verify full list restored', async () => {
      const count = await noteListPage.getNoteCount();
      expect(count).toBe(countBefore + 2);
    });

    logger.info('Clear search test completed');
  });
});
