# Locator Mapping: YAML → POMs

This document maps each element from the scraped YAML data to its corresponding POM locator.

## SidebarPage

| YAML Element | POM Locator | Property Name |
|---|---|---|
| `button[data-testid="sidebar-action-create-new-note"]` | `page.getByTestId('sidebar-action-create-new-note')` | `createNoteButton` |
| `button[text="Scratchpad"]` | `page.getByRole('button', { name: 'Scratchpad' })` | `scratchpadLink` |
| `button[text="Notes"]` | `page.getByRole('button', { name: 'Notes', exact: true })` | `notesLink` |
| `button[text="Favorites"]` | `page.getByRole('button', { name: 'Favorites' })` | `favoritesLink` |
| `button[text="Trash"]` | `page.getByRole('button', { name: 'Trash' })` | `trashLink` |
| `button[data-testid="category-collapse-button"]` | `page.getByTestId('category-collapse-button')` | `categoryCollapseButton` |
| `button[data-testid="add-category-button"]` | `page.getByTestId('add-category-button')` | `addCategoryButton` |
| `input[data-testid="new-category-label"]` | `page.getByTestId('new-category-label')` | `newCategoryInput` |

**Total locators:** 8

---

## NoteListPage

| YAML Element | POM Locator | Property Name |
|---|---|---|
| `input[data-testid="note-search"]` | `page.getByTestId('note-search')` | `searchInput` |
| `div[data-testid^="note-list-item"]` | `page.locator('[data-testid^="note-list-item"]')` | `noteItems` |
| `div[data-testid^="note-options-div"]` | `page.locator('[data-testid^="note-options-div"]')` | `noteOptionsButtons` |
| `div[data-testid^="note-title"]` | `page.locator('[data-testid^="note-title"]')` | `noteTitles` |

**Total locators:** 4

**Note:** `noteItems`, `noteOptionsButtons`, and `noteTitles` use prefix matching (`^=`) to capture all indexed instances.

---

## EditorPage

| YAML Element | POM Locator | Property Name |
|---|---|---|
| `textarea[parentClasses=""]` | `page.getByRole('textbox')` | `editorTextarea` |
| `button[data-testid="preview-mode"]` | `page.getByTestId('preview-mode')` | `previewToggle` |
| `button[text="Add note to favorites"]` | `page.getByRole('button', { name: /add note to favorites/i })` | `favoriteButton` |
| `button[text="Delete note"]` | `page.getByRole('button', { name: /delete note/i })` | `deleteButton` |
| `button[text="Download note"]` | `page.getByRole('button', { name: /download note/i })` | `downloadButton` |
| `button[data-testid="uuid-menu-bar-copy-icon"]` | `page.getByTestId('uuid-menu-bar-copy-icon')` | `copyNoteButton` |
| `button[data-testid="topbar-action-sync-notes"]` | `page.getByTestId('topbar-action-sync-notes')` | `syncNotesButton` |
| `button[text="Themes"]` | `page.getByRole('button', { name: /themes/i })` | `themesButton` |
| `button[text="Settings"]` | `page.getByRole('button', { name: /settings/i })` | `settingsButton` |

**Total locators:** 9

**Locator priority applied:**
- Used `getByRole('textbox')` for textarea (semantic role)
- Used `getByTestId` when available (highest reliability)
- Used `getByRole('button', { name: ... })` for buttons with text (semantic + accessible)
- Used case-insensitive regex matching for button names to handle potential variations

---

## ContextMenuPage

| YAML Element | POM Locator | Property Name |
|---|---|---|
| `div[data-testid="note-option-favorite"]` | `page.getByTestId('note-option-favorite')` | `favoriteOption` |
| `div[data-testid="note-option-trash"]` | `page.getByTestId('note-option-trash')` | `trashOption` |
| `div[data-testid="note-option-download"]` | `page.getByTestId('note-option-download')` | `downloadOption` |
| `div[data-testid="copy-reference-to-note"]` | `page.getByTestId('copy-reference-to-note')` | `copyReferenceOption` |
| (not in YAML, inferred) | `page.getByText('Restore from trash', { exact: true })` | `restoreFromTrashButton` |
| (not in YAML, inferred) | `page.getByText('Delete permanently', { exact: true })` | `deletePermanentlyButton` |

**Total locators:** 6

**Note:** The last two locators were inferred based on app functionality (trash context menu differs from normal note context menu).

---

## SettingsPage

| YAML Element | POM Locator | Property Name |
|---|---|---|
| `div[text="Preferences"][role="button"]` | `page.getByRole('button', { name: 'Preferences' })` | `preferencesTab` |
| `div[text="Keyboard shortcuts"][role="button"]` | `page.getByRole('button', { name: 'Keyboard shortcuts' })` | `keyboardShortcutsTab` |
| `div[text="Data management"][role="button"]` | `page.getByRole('button', { name: 'Data management' })` | `dataManagementTab` |
| `div[text="About TakeNote"][role="button"]` | `page.getByRole('button', { name: 'About TakeNote' })` | `aboutTab` |
| `label[data-testid="active-line-highlight-toggle"]` | `page.getByTestId('active-line-highlight-toggle')` | `activeLineHighlightToggle` |
| `label[data-testid="display-line-nums-toggle"]` | `page.getByTestId('display-line-nums-toggle')` | `displayLineNumbersToggle` |
| `label[data-testid="scroll-past-end-toggle"]` | `page.getByTestId('scroll-past-end-toggle')` | `scrollPastEndToggle` |
| `label[data-testid="markdown-preview-toggle"]` | `page.getByTestId('markdown-preview-toggle')` | `markdownPreviewToggle` |
| `label[data-testid="dark-mode-toggle"]` | `page.getByTestId('dark-mode-toggle')` | `darkModeToggle` |
| `select[data-testid="sort-by-dropdown"]` | `page.getByTestId('sort-by-dropdown')` | `sortByDropdown` |
| `select[data-testid="text-direction-dropdown"]` | `page.getByTestId('text-direction-dropdown')` | `textDirectionDropdown` |
| `button[data-testid="settings-modal-download-notes"]` | `page.getByTestId('settings-modal-download-notes')` | `downloadAllButton` |
| `button[text="Export backup"]` | `page.getByRole('button', { name: 'Export backup' })` | `exportBackupButton` |
| `button[text="Import backup"]` | `page.getByRole('button', { name: 'Import backup' })` | `importBackupButton` |
| `button[text="Log out"]` | `page.getByRole('button', { name: 'Log out' })` | `logOutButton` |

**Total locators:** 15

---

## Summary Statistics

| POM | Locators | Methods | Primary Locator Strategy |
|---|---|---|---|
| SidebarPage | 8 | 7 | getByTestId (5), getByRole (3) |
| NoteListPage | 4 | 7 | getByTestId (1), locator with testid prefix (3) |
| EditorPage | 9 | 11 | getByTestId (3), getByRole (6) |
| ContextMenuPage | 6 | 5 | getByTestId (4), getByText (2) |
| SettingsPage | 15 | 14 | getByTestId (9), getByRole (6) |
| **Total** | **42** | **44** | **getByTestId: 22, getByRole: 15, locator: 3, getByText: 2** |

---

## Locator Strategy Analysis

Following the priority rules:

1. **getByRole (15 instances, 36%)** — Used for semantic HTML with accessible names (buttons, tabs)
2. **getByTestId (22 instances, 52%)** — Used when data-testid attributes exist (most reliable)
3. **getByText (2 instances, 5%)** — Used for unique visible text when no better option
4. **CSS locator with testid prefix (3 instances, 7%)** — Used for indexed collections

**Zero XPath locators used** ✅

---

## Coverage Analysis

### Elements captured from YAML:
- ✅ All sidebar navigation buttons
- ✅ Category management controls
- ✅ Note list search and items
- ✅ All editor toolbar buttons
- ✅ Context menu options
- ✅ All settings tabs and toggles
- ✅ Data management buttons

### Elements NOT in YAML but added (based on app knowledge):
- ✅ Restore from trash button (trash context menu)
- ✅ Delete permanently button (trash context menu)

### Potential gaps (flagged for future scraping):
- Category list items (dynamic, needs runtime scraping)
- Note content preview in list
- Markdown preview panel
- Theme picker modal
- Sync dialog elements
