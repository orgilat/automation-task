import { Page, Locator } from '@playwright/test';
import logger from '../logger';


export class EditorPage {
  readonly page: Page;

  // — Locators ───────────────────────────────────────────────
  readonly editorArea: Locator;
  readonly editorTextarea: Locator;
  readonly previewToggle: Locator;
  readonly favoriteButton: Locator;
  readonly moveToTrashButton: Locator;
  readonly downloadButton: Locator;
  readonly copyNoteButton: Locator;
  readonly syncNotesButton: Locator;
  readonly themesButton: Locator;
  readonly settingsButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // Click .CodeMirror (the visible render layer) — the underlying textarea is
    // blocked by CodeMirror's <pre> overlay and cannot receive pointer events directly
    this.editorArea        = page.locator('.CodeMirror');
    this.editorTextarea    = page.locator('.CodeMirror textarea');
    this.previewToggle     = page.getByTestId('preview-mode');
    this.favoriteButton    = page.getByRole('button', { name: 'Add note to favorites' });
    this.moveToTrashButton = page.getByRole('button', { name: 'Delete note' });
    this.downloadButton    = page.getByRole('button', { name: /download note/i });
    this.copyNoteButton    = page.getByTestId('uuid-menu-bar-copy-icon');
    this.syncNotesButton   = page.getByTestId('topbar-action-sync-notes');
    this.themesButton      = page.getByRole('button', { name: /themes/i });
    this.settingsButton    = page.getByRole('button', { name: /settings/i });
  }

  // — Methods ────────────────────────────────────────────────

  /** Clicks the CodeMirror editor surface and types the given text */
  async typeContent(text: string): Promise<void> {
    logger.info(`[Editor] Typing content: "${text.slice(0, 40)}${text.length > 40 ? '…' : ''}"`);
    await this.editorArea.click();
    await this.page.keyboard.type(text);
  }

  /** Selects all content in the editor and deletes it */
  async clearContent(): Promise<void> {
    logger.info('[Editor] Clearing content');
    await this.editorArea.click();
    await this.page.keyboard.press('ControlOrMeta+a');
    await this.page.keyboard.press('Delete');
  }

  /** Returns the current text content visible in the CodeMirror editor */
  async getContent(): Promise<string> {
    const raw = await this.editorTextarea.inputValue();
    const content = raw.replace(/​/g, '').trim();
    logger.debug(`[Editor] getContent → ${content.length} chars`);
    return content;
  }

  /** Toggles markdown preview mode */
  async togglePreview(): Promise<void> {
    logger.info('[Editor] Toggling preview mode');
    await this.previewToggle.click();
  }

  /** Toggles favorite on the current note */
  async toggleFavorite(): Promise<void> {
    logger.info('[Editor] Toggling favorite');
    await this.favoriteButton.click();
  }

  /** Deletes the current note (moves to trash) */
  async deleteNote(): Promise<void> {
    logger.info('[Editor] Moving note to trash');
    await this.moveToTrashButton.click();
  }

  /** Downloads the current note */
  async downloadNote(): Promise<void> {
    logger.info('[Editor] Downloading note');
    await this.downloadButton.click();
  }

  /** Copies the note reference/UUID */
  async copyNoteReference(): Promise<void> {
    logger.info('[Editor] Copying note reference');
    await this.copyNoteButton.click();
  }

  /** Opens sync notes dialog */
  async openSyncDialog(): Promise<void> {
    logger.info('[Editor] Opening sync dialog');
    await this.syncNotesButton.click();
  }

  /** Opens themes selector */
  async openThemes(): Promise<void> {
    logger.info('[Editor] Opening themes');
    await this.themesButton.click();
  }

  /** Opens the settings panel */
  async openSettings(): Promise<void> {
    logger.info('[Editor] Opening settings');
    await this.settingsButton.click();
  }
}
