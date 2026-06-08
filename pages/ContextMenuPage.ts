import { Page, Locator } from '@playwright/test';
import logger from '../logger';

export class ContextMenuPage {
  readonly page: Page;

  // — Locators ───────────────────────────────────────────────
  readonly favoriteOption: Locator;
  readonly trashOption: Locator;
  readonly downloadOption: Locator;
  readonly copyReferenceOption: Locator;
  readonly restoreFromTrashButton: Locator;
  readonly deletePermanentlyButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.favoriteOption        = page.getByTestId('note-option-favorite');
    this.trashOption           = page.getByTestId('note-option-trash');
    this.downloadOption        = page.getByTestId('note-option-download');
    this.copyReferenceOption   = page.getByTestId('copy-reference-to-note');
    this.restoreFromTrashButton  = page.getByText('Restore from trash', { exact: true });
    this.deletePermanentlyButton = page.getByText('Delete permanently', { exact: true });
  }

  // — Methods ────────────────────────────────────────────────

  /** Clicks the "Mark as favorite" context menu item */
  async favorite(): Promise<void> {
    logger.info('[ContextMenu] Marking note as favorite');
    await this.favoriteOption.click();
  }

  /** Clicks the "Move to trash" context menu item */
  async moveToTrash(): Promise<void> {
    logger.info('[ContextMenu] Moving note to trash');
    await this.trashOption.click();
  }

  /** Clicks the "Download" context menu item */
  async download(): Promise<void> {
    logger.info('[ContextMenu] Downloading note');
    await this.downloadOption.click();
  }

  /** Restores the selected note from Trash */
  async restoreFromTrash(): Promise<void> {
    logger.info('[ContextMenu] Restoring note from trash');
    await this.restoreFromTrashButton.click();
  }

  /** Permanently deletes the selected note from Trash */
  async deletePermanently(): Promise<void> {
    logger.info('[ContextMenu] Permanently deleting note');
    await this.deletePermanentlyButton.click();
  }
}
