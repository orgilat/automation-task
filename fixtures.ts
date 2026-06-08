import { test as base, expect, Page } from '@playwright/test';
import { clearAppState } from './helpers/localStorage';
import { waitForAppReady } from './helpers/waitForApp';
import { NoteListPage } from './pages/NoteListPage';
import { SidebarPage } from './pages/SidebarPage';
import { EditorPage } from './pages/EditorPage';
import { ContextMenuPage } from './pages/ContextMenuPage';
import { SettingsPage } from './pages/SettingsPage';
import logger from './logger';

type AppFixtures = {
  cleanPage: Page;
  noteListPage: NoteListPage;
  sidebarPage: SidebarPage;
  editorPage: EditorPage;
  contextMenuPage: ContextMenuPage;
  settingsPage: SettingsPage;
};

export const test = base.extend<AppFixtures>({
  /**
   * cleanPage: a page that has navigated to the app and cleared all state.
   * Use this fixture in every E2E test that needs isolation.
   */
  cleanPage: async ({ page }, use, testInfo) => {
    logger.info(`Setting up cleanPage for: ${testInfo.title}`);
    await page.goto('/app');
    await waitForAppReady(page);
    await clearAppState(page);
    await page.reload();
    await waitForAppReady(page);

    await use(page);
    logger.info(`Tearing down cleanPage for: ${testInfo.title}`);
  },
  noteListPage: async ({ page }, use) => {
    await use(new NoteListPage(page));
  },
  sidebarPage: async ({ page }, use) => {
    await use(new SidebarPage(page));
  },
  editorPage: async ({ page }, use) => {
    await use(new EditorPage(page));
  },
  contextMenuPage: async ({ page }, use) => {
    await use(new ContextMenuPage(page));
  },
  settingsPage: async ({ page }, use) => {
    await use(new SettingsPage(page));
  },
});

export { expect };
