import { test, expect } from '../../../fixtures';
import { allure } from 'allure-playwright';
import { setFunctionalAllureMeta, addTestDescription } from '../../../helpers/allureLabels';
import logger from '../../../logger';

test.describe('@notes Notes CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('domcontentloaded');
    
    setFunctionalAllureMeta({
      layer: 'e2e',
      suite: 'Notes',
      subSuite: 'CRUD',
      component: 'NoteList',
      severity: 'critical',
    });
  });

  test('Creates a new note', async ({ page, sidebarPage, noteListPage }) => {
    addTestDescription({
      whatIsTested: 'A user can create a new note and it appears in the note list.',
      testSteps: ['Record initial count', 'Click create note button', 'Verify count increased by 1'],
    });

    const countBefore = await noteListPage.getNoteCount();

    await allure.step('Create a new note', async () => {
      await sidebarPage.createNote();
    });

    await allure.step('Verify note appears in list', async () => {
      const countAfter = await noteListPage.getNoteCount();
      expect(countAfter).toBe(countBefore + 1);
    });

    logger.info('Note creation test completed');
  });

  test('Typed content appears in editor', async ({ page, sidebarPage, editorPage }) => {
    addTestDescription({
      whatIsTested: 'Content typed in the editor is visible.',
      testSteps: ['Create note', 'Type content', 'Verify content appears'],
    });

    await allure.step('Create a new note', async () => {
      await sidebarPage.createNote();
    });

    await allure.step('Type content', async () => {
      await editorPage.typeContent('Hello world');
    });

    await allure.step('Verify content appears', async () => {
      const content = await editorPage.getContent();
      expect(content).toContain('Hello world');
    });

    logger.info('Content typing test completed');
  });

  test('Delete via toolbar removes note from list', async ({ page, sidebarPage, editorPage, noteListPage }) => {
    addTestDescription({
      whatIsTested: 'Deleting a note via toolbar removes it from the list.',
      testSteps: ['Record initial count', 'Create note', 'Delete via toolbar', 'Verify count returns to initial'],
    });

    const countBefore = await noteListPage.getNoteCount();

    await allure.step('Create a new note', async () => {
      await sidebarPage.createNote();
      await noteListPage.selectNoteAt(0);
    });

    await allure.step('Delete note via toolbar', async () => {
      await editorPage.deleteNote();
    });

    await allure.step('Verify note removed from list', async () => {
      const count = await noteListPage.getNoteCount();
      expect(count).toBe(countBefore);
    });

    logger.info('Delete via toolbar test completed');
  });

  test('Creating 3 notes yields count of 3', async ({ page, sidebarPage, noteListPage }) => {
    addTestDescription({
      whatIsTested: 'Multiple notes can be created and counted correctly.',
      testSteps: ['Record initial count', 'Create 3 notes', 'Verify count increased by 3'],
    });

    const countBefore = await noteListPage.getNoteCount();

    await allure.step('Create first note', async () => {
      await sidebarPage.createNote();
    });

    await allure.step('Create second note', async () => {
      await sidebarPage.createNote();
    });

    await allure.step('Create third note', async () => {
      await sidebarPage.createNote();
    });

    await allure.step('Verify note count increased by 3', async () => {
      const countAfter = await noteListPage.getNoteCount();
      expect(countAfter).toBe(countBefore + 3);
    });

    logger.info('Multiple notes creation test completed');
  });
});
