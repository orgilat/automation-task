import { test as base, expect, Page } from '@playwright/test';
import { clearAppState } from './helpers/localStorage';
import { waitForAppReady } from './helpers/waitForApp';
import logger from './logger';

// ─────────────────────────────────────────────────────────────
// Page Object fixtures — register new POMs here as they are built.
// Pattern (do not uncomment until the POM file exists):
//
//   import { NoteListPage } from './pages/NoteListPage';
//   type MyFixtures = { noteListPage: NoteListPage };
//   export const test = base.extend<MyFixtures>({
//     noteListPage: async ({ page }, use) => {
//       await use(new NoteListPage(page));
//     },
//   });
// ─────────────────────────────────────────────────────────────

type AppFixtures = {
  cleanPage: Page;
};

export const test = base.extend<AppFixtures>({
  /**
   * cleanPage: a page that has navigated to the app and cleared all state.
   * Use this fixture in every E2E test that needs isolation.
   */
  cleanPage: async ({ page }, use, testInfo) => {
    logger.info(`Setting up cleanPage for: ${testInfo.title}`);
    await page.goto('/');
    await waitForAppReady(page);
    await clearAppState(page);
    await page.reload();
    await waitForAppReady(page);
    await use(page);
    logger.info(`Tearing down cleanPage for: ${testInfo.title}`);
  },
});

export { expect };
