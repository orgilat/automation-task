# POM Registry

> ⚠️ AGENTS: Read this file before writing any test or helper.
> NEVER call a method that is not listed here.
> NEVER reference a locator property that is not listed here.
> If you need something that does not exist — flag it as a TODO comment, do not invent it.

---

## Fixture names (quick reference)

| Fixture | Class | File |
|---|---|---|
| `sidebarPage` | `SidebarPage` | `pages/SidebarPage.ts` |
| `noteListPage` | `NoteListPage` | `pages/NoteListPage.ts` |
| `editorPage` | `EditorPage` | `pages/EditorPage.ts` |
| `contextMenuPage` | `ContextMenuPage` | `pages/ContextMenuPage.ts` |
| `settingsPage` | `SettingsPage` | `pages/SettingsPage.ts` |

---

## SidebarPage

**Fixture:** `sidebarPage`
**File:** `pages/SidebarPage.ts`
**Region:** Left sidebar — navigation + categories

### Locators

| Property | Locator expression |
|---|---|
| `createNoteButton` | `page.getByRole('button', { name: 'Create new note' })` |
| `scratchpadLink` | `page.getByRole('button', { name: 'Scratchpad' })` |
| `notesLink` | `page.getByRole('button', { name: 'Notes', exact: true })` |
| `favoritesLink` | `page.getByRole('button', { name: 'Favorites' })` |
| `trashLink` | `page.getByRole('button', { name: 'Trash' })` |
| `categoryCollapseButton` | `page.getByTestId('category-collapse-button')` |
| `addCategoryButton` | `page.getByRole('button', { name: 'Add category' })` |
| `newCategoryInput` | `page.getByTestId('new-category-label')` |

> `notesLink` uses `exact: true` to avoid matching "All Notes" text fragments.

### Methods

| Method | Description |
|---|---|
| `createNote()` | Clicks the sidebar create button to add a new empty note |
| `goToScratchpad()` | Clicks the Scratchpad nav button |
| `goToNotes()` | Clicks the Notes nav button to open the All Notes view |
| `goToFavorites()` | Clicks the Favorites nav button |
| `goToTrash()` | Clicks the Trash nav button |
| `toggleCategoryList()` | Toggles the category list expansion/collapse |
| `createCategory(name: string)` | Opens the new-category input, types the name, confirms with Enter |

---

## NoteListPage

**Fixture:** `noteListPage`
**File:** `pages/NoteListPage.ts`
**Region:** Note list — middle column

### Locators

| Property | Locator expression |
|---|---|
| `searchInput` | `page.getByTestId('note-search')` |
| `noteItems` | `page.locator('[data-testid^="note-list-item"]')` |
| `noteOptionsButtons` | `page.locator('[data-testid^="note-options-div"]')` |
| `noteTitles` | `page.locator('[data-testid^="note-title"]')` |

> `noteItems` matches all indexed testids (`note-list-item-0`, `note-list-item-1`, …). Use `getNoteAt(index)` to address a specific item.
> `noteOptionsButtons` matches `note-options-div-0`, `note-options-div-1`, …. Use `getNoteOptionsAt(index)` to open the three-dots menu on a specific note.

### Methods

| Method | Description |
|---|---|
| `search(query: string)` | Fills the search box with the given query |
| `clearSearch()` | Clears the search input |
| `getNoteAt(index: number): Locator` | Returns the note list item at the given 0-based index |
| `getNoteTitleAt(index: number): Locator` | Returns the note title element at the given 0-based index |
| `getNoteCount(): Promise<number>` | Returns the number of visible note list items |
| `getNoteOptionsAt(index: number): Locator` | Returns the three-dots options button for the note at 0-based index |
| `openNoteOptions(index: number)` | Opens the context menu for a note at the given index |

---

## EditorPage

**Fixture:** `editorPage`
**File:** `pages/EditorPage.ts`
**Region:** Editor panel — right column + note toolbar

### Locators

| Property | Locator expression |
|---|---|
| `editorArea` | `page.locator('.CodeMirror')` |
| `previewToggle` | `page.getByTestId('preview-mode')` |
| `favoriteButton` | `page.getByRole('button', { name: 'Add note to favorites' })` |
| `moveToTrashButton` | `page.getByRole('button', { name: 'Delete note' })` |
| `downloadButton` | `page.getByRole('button', { name: /download note/i })` |
| `copyNoteButton` | `page.getByTestId('uuid-menu-bar-copy-icon')` |
| `syncNotesButton` | `page.getByTestId('topbar-action-sync-notes')` |
| `themesButton` | `page.getByRole('button', { name: /themes/i })` |
| `settingsButton` | `page.getByRole('button', { name: /settings/i })` |

> `editorTextarea` targets `role=textbox` which resolves to the CodeMirror textarea. The search box uses `type=search` (role `searchbox`) so there is no ambiguity.

### Methods

| Method | Description |
|---|---|
| `typeContent(text: string)` | Clicks the editor area and types the given text |
| `clearContent()` | Selects all content (Ctrl/Cmd+A) and deletes it |
| `getContent(): Promise<string>` | Returns the current raw text content of the editor |
| `togglePreview()` | Toggles markdown preview mode |
| `toggleFavorite()` | Toggles favorite on the current note |
| `deleteNote()` | Deletes the current note (moves to trash) |
| `downloadNote()` | Downloads the current note |
| `copyNoteReference()` | Copies the note reference/UUID |
| `openSyncDialog()` | Opens sync notes dialog |
| `openThemes()` | Opens themes selector |
| `openSettings()` | Opens the settings panel |

---

## ContextMenuPage

**Fixture:** `contextMenuPage`
**File:** `pages/ContextMenuPage.ts`
**Region:** Right-click context menu on a note list item

> This POM only provides locators and actions for the menu itself. To open the menu, use `NoteListPage.openNoteOptions(index)` or right-click a note item via `NoteListPage.getNoteAt(index).click({ button: 'right' })`.

### Locators

| Property | Locator expression |
|---|---|
| `favoriteOption` | `page.getByTestId('note-option-favorite')` |
| `trashOption` | `page.getByTestId('note-option-trash')` |
| `downloadOption` | `page.getByTestId('note-option-download')` |
| `copyReferenceOption` | `page.getByTestId('copy-reference-to-note')` |
| `restoreFromTrashButton` | `page.getByText('Restore from trash', { exact: true })` |
| `deletePermanentlyButton` | `page.getByText('Delete permanently', { exact: true })` |

### Methods

| Method | Description |
|---|---|
| `favorite()` | Clicks the "Mark as favorite" context menu item |
| `moveToTrash()` | Clicks the "Move to trash" context menu item |
| `download()` | Clicks the "Download" context menu item |
| `restoreFromTrash()` | Restores the selected note from Trash |
| `deletePermanently()` | Permanently deletes the selected note from Trash |

---

## SettingsPage

**Fixture:** `settingsPage`
**File:** `pages/SettingsPage.ts`
**Region:** Settings panel — opened via the Settings toolbar button

> To open settings, call `editorPage.openSettings()` before using this POM's locators.

### Locators

| Property | Locator expression |
|---|---|
| `preferencesTab` | `page.getByRole('button', { name: 'Preferences' })` |
| `keyboardShortcutsTab` | `page.getByRole('button', { name: 'Keyboard shortcuts' })` |
| `dataManagementTab` | `page.getByRole('button', { name: 'Data management' })` |
| `aboutTab` | `page.getByRole('button', { name: 'About TakeNote' })` |
| `activeLineHighlightToggle` | `page.getByTestId('active-line-highlight-toggle')` |
| `displayLineNumbersToggle` | `page.getByTestId('display-line-nums-toggle')` |
| `scrollPastEndToggle` | `page.getByTestId('scroll-past-end-toggle')` |
| `markdownPreviewToggle` | `page.getByTestId('markdown-preview-toggle')` |
| `darkModeToggle` | `page.getByTestId('dark-mode-toggle')` |
| `sortByDropdown` | `page.getByTestId('sort-by-dropdown')` |
| `textDirectionDropdown` | `page.getByTestId('text-direction-dropdown')` |
| `downloadAllButton` | `page.getByTestId('settings-modal-download-notes')` |
| `exportBackupButton` | `page.getByRole('button', { name: 'Export backup' })` |
| `importBackupButton` | `page.getByRole('button', { name: 'Import backup' })` |
| `logOutButton` | `page.getByRole('button', { name: 'Log out' })` |

> Toggles are `<label class="switch">` elements with data-testid. Clicking the label flips the underlying checkbox.

### Methods

| Method | Description |
|---|---|
| `goToPreferences()` | Navigates to the Preferences tab |
| `goToKeyboardShortcuts()` | Navigates to the Keyboard shortcuts tab |
| `goToDataManagement()` | Navigates to the Data management tab |
| `goToAbout()` | Navigates to the About TakeNote tab |
| `toggle(testId: string)` | Clicks a toggle switch by its data-testid value |
| `toggleDarkMode()` | Toggles dark mode |
| `toggleMarkdownPreview()` | Toggles markdown preview |
| `toggleLineNumbers()` | Toggles line numbers display |
| `selectSortBy(option: 'Title' \| 'Date Created' \| 'Last Updated')` | Selects a sort option from the dropdown |
| `selectTextDirection(direction: 'Left to right' \| 'Right to left')` | Selects text direction from the dropdown |
| `downloadAll()` | Navigates to Data management tab and clicks Download all notes |
| `exportBackup()` | Navigates to Data management tab and clicks Export backup |
| `importBackup(_filePath: string)` | Stub — navigates to Data management tab and clicks Import backup (TODO: wire up file input) |
| `logOut()` | Logs out (if authenticated) |
