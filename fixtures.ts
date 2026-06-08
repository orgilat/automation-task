import { test as base, expect, Page } from '@playwright/test';
import { NoteListPage } from './pages/NoteListPage';
import { SidebarPage } from './pages/SidebarPage';
import { EditorPage } from './pages/EditorPage';
import { ContextMenuPage } from './pages/ContextMenuPage';
import { SettingsPage } from './pages/SettingsPage';
import logger from './logger';

type AppFixtures = {
  noteListPage: NoteListPage;
  sidebarPage: SidebarPage;
  editorPage: EditorPage;
  contextMenuPage: ContextMenuPage;
  settingsPage: SettingsPage;
};

export const test = base.extend<AppFixtures>({
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
