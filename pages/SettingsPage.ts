import { Page, Locator } from '@playwright/test';
import logger from '../logger';

export class SettingsPage {
  readonly page: Page;

  // — Locators ───────────────────────────────────────────────
  readonly preferencesTab: Locator;
  readonly keyboardShortcutsTab: Locator;
  readonly dataManagementTab: Locator;
  readonly aboutTab: Locator;
  readonly activeLineHighlightToggle: Locator;
  readonly displayLineNumbersToggle: Locator;
  readonly scrollPastEndToggle: Locator;
  readonly markdownPreviewToggle: Locator;
  readonly darkModeToggle: Locator;
  readonly sortByDropdown: Locator;
  readonly textDirectionDropdown: Locator;
  readonly downloadAllButton: Locator;
  readonly exportBackupButton: Locator;
  readonly importBackupButton: Locator;
  readonly logOutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.preferencesTab            = page.getByRole('button', { name: 'Preferences' });
    this.keyboardShortcutsTab      = page.getByRole('button', { name: 'Keyboard shortcuts' });
    this.dataManagementTab         = page.getByRole('button', { name: 'Data management' });
    this.aboutTab                  = page.getByRole('button', { name: 'About TakeNote' });
    this.activeLineHighlightToggle = page.getByTestId('active-line-highlight-toggle');
    this.displayLineNumbersToggle  = page.getByTestId('display-line-nums-toggle');
    this.scrollPastEndToggle       = page.getByTestId('scroll-past-end-toggle');
    this.markdownPreviewToggle     = page.getByTestId('markdown-preview-toggle');
    this.darkModeToggle            = page.getByTestId('dark-mode-toggle');
    this.sortByDropdown            = page.getByTestId('sort-by-dropdown');
    this.textDirectionDropdown     = page.getByTestId('text-direction-dropdown');
    this.downloadAllButton         = page.getByTestId('settings-modal-download-notes');
    this.exportBackupButton        = page.getByRole('button', { name: 'Export backup' });
    this.importBackupButton        = page.getByRole('button', { name: 'Import backup' });
    this.logOutButton              = page.getByRole('button', { name: 'Log out' });
  }

  // — Methods ────────────────────────────────────────────────

  /** Navigates to the Preferences tab */
  async goToPreferences(): Promise<void> {
    logger.info('[Settings] Navigating to Preferences tab');
    await this.preferencesTab.click();
  }

  /** Navigates to the Keyboard shortcuts tab */
  async goToKeyboardShortcuts(): Promise<void> {
    logger.info('[Settings] Navigating to Keyboard shortcuts tab');
    await this.keyboardShortcutsTab.click();
  }

  /** Navigates to the Data management tab */
  async goToDataManagement(): Promise<void> {
    logger.info('[Settings] Navigating to Data management tab');
    await this.dataManagementTab.click();
  }

  /** Navigates to the About TakeNote tab */
  async goToAbout(): Promise<void> {
    logger.info('[Settings] Navigating to About tab');
    await this.aboutTab.click();
  }

  /** Clicks a toggle switch identified by its data-testid value */
  async toggle(testId: string): Promise<void> {
    logger.info(`[Settings] Toggling: ${testId}`);
    await this.page.getByTestId(testId).click();
  }

  /** Toggles dark mode */
  async toggleDarkMode(): Promise<void> {
    logger.info('[Settings] Toggling dark mode');
    await this.darkModeToggle.click();
  }

  /** Toggles markdown preview */
  async toggleMarkdownPreview(): Promise<void> {
    logger.info('[Settings] Toggling markdown preview');
    await this.markdownPreviewToggle.click();
  }

  /** Toggles line numbers display */
  async toggleLineNumbers(): Promise<void> {
    logger.info('[Settings] Toggling line numbers');
    await this.displayLineNumbersToggle.click();
  }

  /** Selects a sort option from the dropdown */
  async selectSortBy(option: 'Title' | 'Date Created' | 'Last Updated'): Promise<void> {
    logger.info(`[Settings] Sort by: ${option}`);
    await this.sortByDropdown.selectOption({ label: option });
  }

  /** Selects text direction from the dropdown */
  async selectTextDirection(direction: 'Left to right' | 'Right to left'): Promise<void> {
    logger.info(`[Settings] Text direction: ${direction}`);
    await this.textDirectionDropdown.selectOption({ label: direction });
  }

  /** Clicks the "Download all notes" button on the Data management tab */
  async downloadAll(): Promise<void> {
    logger.info('[Settings] Downloading all notes');
    await this.goToDataManagement();
    await this.downloadAllButton.click();
  }

  /** Clicks the "Export backup" button on the Data management tab */
  async exportBackup(): Promise<void> {
    logger.info('[Settings] Exporting backup');
    await this.goToDataManagement();
    await this.exportBackupButton.click();
  }

  /** Stub: triggers the import backup file picker */
  async importBackup(_filePath: string): Promise<void> {
    logger.info('[Settings] Import backup (stub)');
    await this.goToDataManagement();
    await this.importBackupButton.click();
  }

  /** Logs out (if authenticated) */
  async logOut(): Promise<void> {
    logger.info('[Settings] Logging out');
    await this.logOutButton.click();
  }
}
