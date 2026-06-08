import { test, expect } from '../../../fixtures';
import { allure } from 'allure-playwright';
import { setFunctionalAllureMeta, addTestDescription } from '../../../helpers/allureLabels';
import logger from '../../../logger';

test.describe('@trash Trash', () => {
  test.beforeEach(async () => {
    setFunctionalAllureMeta({
      layer: 'e2e',
      suite: 'Notes',
      subSuite: 'Trash',
      component: 'Sidebar',
      severity: 'critical',
    });
  });

  test('Delete via toolbar sends note to Trash', async ({ cleanPage, sidebarPage, editorPage, noteListPage }) => {
    addTestDescription({
      whatIsTested: 'Deleting a note via toolbar moves it to Trash.',
      testSteps: ['Create note', 'Delete via toolbar', 'Navigate to Trash', 'Verify note present'],
    });

    await allure.step('Create a new note', async () => {
      await sidebarPage.createNote();
      await noteListPage.selectNoteAt(0);
    });

    await allure.step('Delete note via toolbar', async () => {
      await editorPage.deleteNote();
    });

    await allure.step('Navigate to Trash', async () => {
      await sidebarPage.goToTrash();
    });

    await allure.step('Verify note in Trash', async () => {
      const count = await noteListPage.getNoteCount();
      expect(count).toBe(1);
    });

    logger.info('Delete via toolbar test completed');
  });

  test('Delete via menu sends note to Trash', async ({ cleanPage, sidebarPage, noteListPage, contextMenuPage }) => {
    addTestDescription({
      whatIsTested: 'Deleting a note via context menu moves it to Trash.',
      testSteps: ['Create note', 'Open menu', 'Delete', 'Navigate to Trash', 'Verify present'],
    });

    await allure.step('Create a new note', async () => {
      await sidebarPage.createNote();
    });

    await allure.step('Delete via context menu', async () => {
      await noteListPage.openNoteOptions(0);
      await contextMenuPage.moveToTrash();
    });

    await allure.step('Navigate to Trash', async () => {
      await sidebarPage.goToTrash();
    });

    await allure.step('Verify note in Trash', async () => {
      const count = await noteListPage.getNoteCount();
      expect(count).toBe(1);
    });

    logger.info('Delete via menu test completed');
  });

  test('Restore from Trash returns note to Notes', async ({ cleanPage, sidebarPage, editorPage, noteListPage, contextMenuPage }) => {
    addTestDescription({
      whatIsTested: 'Restoring a note from Trash returns it to Notes.',
      testSteps: ['Create and delete note', 'Navigate to Trash', 'Restore', 'Navigate to Notes', 'Verify present'],
    });

    await allure.step('Create a new note', async () => {
      await sidebarPage.createNote();
      await noteListPage.selectNoteAt(0);
    });

    const countBefore = await noteListPage.getNoteCount();

    await allure.step('Delete note', async () => {
      await editorPage.deleteNote();
    });

    await allure.step('Navigate to Trash', async () => {
      await sidebarPage.goToTrash();
    });

    await allure.step('Restore note', async () => {
      await noteListPage.openNoteOptions(0);
      await contextMenuPage.restoreFromTrash();
    });

    await allure.step('Navigate to Notes', async () => {
      await sidebarPage.goToNotes();
    });

    await allure.step('Verify note restored', async () => {
      const count = await noteListPage.getNoteCount();
      expect(count).toBe(countBefore);
    });

    logger.info('Restore from Trash test completed');
  });

  test('Trashed note absent from Notes view', async ({ cleanPage, sidebarPage, editorPage, noteListPage }) => {
    addTestDescription({
      whatIsTested: 'A trashed note does not appear in the Notes view.',
      testSteps: ['Create note', 'Delete it', 'Navigate to Notes', 'Verify count is 0'],
    });

    await allure.step('Create a new note', async () => {
      await sidebarPage.createNote();
      await noteListPage.selectNoteAt(0);
    });

    const countBefore = await noteListPage.getNoteCount();

    await allure.step('Delete note', async () => {
      await editorPage.deleteNote();
    });

    await allure.step('Navigate to Notes', async () => {
      await sidebarPage.goToNotes();
    });

    await allure.step('Verify note absent from Notes', async () => {
      const count = await noteListPage.getNoteCount();
      expect(count).toBe(countBefore - 1);
    });

    logger.info('Trashed note absent test completed');
  });

  test('Delete 2 of 3 notes leaves 2 in Trash', async ({ cleanPage, sidebarPage, editorPage, noteListPage }) => {
    addTestDescription({
      whatIsTested: 'Deleting multiple notes moves them all to Trash.',
      testSteps: ['Create 3 notes', 'Delete first two', 'Navigate to Trash', 'Verify count is 2'],
    });

    await allure.step('Create first note', async () => {
      await sidebarPage.createNote();
    });

    await allure.step('Create second note', async () => {
      await sidebarPage.createNote();
    });

    await allure.step('Create third note', async () => {
      await sidebarPage.createNote();
    });

    await allure.step('Delete first note', async () => {
      await noteListPage.selectNoteAt(0);
      await editorPage.deleteNote();
    });

    await allure.step('Delete second note', async () => {
      await noteListPage.selectNoteAt(0);
      await editorPage.deleteNote();
    });

    await allure.step('Navigate to Trash', async () => {
      await sidebarPage.goToTrash();
    });

    await allure.step('Verify 2 notes in Trash', async () => {
      const count = await noteListPage.getNoteCount();
      expect(count).toBe(2);
    });

    logger.info('Multiple deletes test completed');
  });
});
