import { Page, Locator, expect } from '@playwright/test';
import logger from '../logger';

export class NoteListPage {
  readonly page: Page;

  // — Locators ───────────────────────────────────────────────
  readonly searchInput: Locator;
  readonly noteItems: Locator;
  readonly noteOptionsButtons: Locator;
  readonly noteTitles: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput        = page.getByTestId('note-search');
    this.noteItems          = page.locator('[data-testid^="note-list-item"]');
    this.noteOptionsButtons = page.locator('[data-testid^="note-options-div"]');
    this.noteTitles         = page.locator('[data-testid^="note-title"]');
  }

  // — Methods ────────────────────────────────────────────────

  /** Types into the search box to trigger TakeNote's filter */
  async search(query: string): Promise<void> {
    logger.info(`[NoteList] Searching for: "${query}"`);
    await this.searchInput.click();
    await this.searchInput.clear();
    await this.page.keyboard.type(query);
    // Wait for search results to update by ensuring note items are in stable state
    await this.page.waitForLoadState('domcontentloaded');
  }

  /** Clears the search input and waits for the list to restore */
  async clearSearch(): Promise<void> {
    logger.info('[NoteList] Clearing search');
    await this.searchInput.clear();
    // Wait for full list to restore by ensuring page has processed the clear action
    await this.page.waitForLoadState('domcontentloaded');
  }

  /** Returns the note list item at the given 0-based index */
  getNoteAt(index: number): Locator {
    logger.debug(`[NoteList] Getting note at index ${index}`);
    return this.noteItems.nth(index);
  }

  /** Returns the note title element at the given 0-based index */
  getNoteTitleAt(index: number): Locator {
    logger.debug(`[NoteList] Getting note title at index ${index}`);
    return this.noteTitles.nth(index);
  }

  /** Returns the number of visible note list items */
  async getNoteCount(): Promise<number> {
    const count = await this.noteItems.count();
    logger.info(`[NoteList] Note count: ${count}`);
    return count;
  }

  /** Returns the three-dots options button for the note at 0-based index */
  getNoteOptionsAt(index: number): Locator {
    logger.debug(`[NoteList] Getting options button at index ${index}`);
    return this.noteOptionsButtons.nth(index);
  }

  /** Opens the context menu for a note at the given index */
  async openNoteOptions(index: number): Promise<void> {
    logger.info(`[NoteList] Opening context menu for note at index ${index}`);
    await this.noteItems.nth(index).click();
    await this.noteItems.nth(index).hover();
    await expect(this.noteOptionsButtons.nth(index)).toBeVisible();
    await this.noteOptionsButtons.nth(index).click();
  }

  /** Clicks a note at 0-based index to select it and open it in the editor */
  async selectNoteAt(index: number): Promise<void> {
    logger.info(`[NoteList] Selecting note at index ${index}`);
    await this.noteItems.nth(index).click();
    await this.page.locator('.CodeMirror').waitFor({ state: 'visible' });
  }
}
