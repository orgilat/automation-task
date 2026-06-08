import { Page, Locator } from '@playwright/test';
import logger from '../logger';
import { expect } from '../fixtures';

export class SidebarPage {
  readonly page: Page;

  // — Locators ───────────────────────────────────────────────
  readonly createNoteButton: Locator;
  readonly scratchpadLink: Locator;
  readonly notesLink: Locator;
  readonly favoritesLink: Locator;
  readonly trashLink: Locator;
  readonly categoryCollapseButton: Locator;
  readonly addCategoryButton: Locator;
  readonly newCategoryInput: Locator;
  readonly codeMirror: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createNoteButton       = page.getByRole('button', { name: 'Create new note' });
    this.scratchpadLink         = page.getByRole('button', { name: 'Scratchpad' });
    this.notesLink              = page.getByRole('button', { name: 'Notes', exact: true });
    this.favoritesLink          = page.getByRole('button', { name: 'Favorites', exact: true });
    this.trashLink              = page.getByRole('button', { name: 'Trash' });
    this.categoryCollapseButton = page.getByTestId('category-collapse-button');
    this.addCategoryButton      = page.getByRole('button', { name: 'Add category' });
    this.newCategoryInput       = page.getByTestId('new-category-label');
    this.codeMirror             = page.locator('.CodeMirror');
  }

  // — Methods ────────────────────────────────────────────────

  /** Creates a new note. Passes content so the editor toolbar renders; pass '' for an empty note. */
  async createNote(content: string = 'Test note content'): Promise<void> {
    logger.info('[Sidebar] Creating new note');
    await this.createNoteButton.click();
    await this.codeMirror.waitFor({ state: 'visible', timeout: 5000 });
    if (content) {
      await this.codeMirror.click();
      await this.page.keyboard.type(content);
      await expect(this.codeMirror).toContainText(content);
    }
  }

  /** Navigates to the Scratchpad view */
  async goToScratchpad(): Promise<void> {
    logger.info('[Sidebar] Navigating to Scratchpad');
    await this.scratchpadLink.click();
  }

  /** Navigates to the All Notes view */
  async goToNotes(): Promise<void> {
    logger.info('[Sidebar] Navigating to Notes');
    await this.notesLink.click();
  }

  /** Navigates to the Favorites view */
  async goToFavorites(): Promise<void> {
    logger.info('[Sidebar] Navigating to Favorites');
    await this.favoritesLink.click();
  }

  /** Navigates to the Trash view */
  async goToTrash(): Promise<void> {
    logger.info('[Sidebar] Navigating to Trash');
    await this.trashLink.click();
  }

  /** Toggles the category list expansion */
  async toggleCategoryList(): Promise<void> {
    logger.info('[Sidebar] Toggling category list');
    await this.categoryCollapseButton.click();
  }

  /** Opens the new-category input, types a name, and confirms with Enter */
  async createCategory(name: string): Promise<void> {
    logger.info(`[Sidebar] Creating category: "${name}"`);
    await this.addCategoryButton.click();
    await this.newCategoryInput.fill(name);
    await this.page.keyboard.press('Enter');
  }
}
