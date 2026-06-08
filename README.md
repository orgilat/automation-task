# TakeNote QA Suite

End-to-end test automation suite for [TakeNote](https://takenote.dev) — an open-source, client-side React notes application. Built with Playwright and TypeScript, following the Page Object Model pattern with Allure reporting and GitHub Actions CI.

## Features

- **Playwright + TypeScript** — strongly-typed tests with full IDE support
- **Page Object Model** — one class per UI region, no raw locators in specs
- **Reusable fixtures** — injected POMs wired through `fixtures.ts`; fresh browser context per test
- **Allure reporting** — steps, screenshots, traces, metadata, and trend history
- **Structured logging** — Winston logger across all POMs and fixtures
- **GitHub Actions CI** — runs on every push and PR, uploads Allure report as artifact

## Project Structure

```
takenote-qa-suite/
├── .github/
│   └── workflows/
│       └── e2e.yml              # CI: run tests + upload Allure report
├── pages/                       # Page Object Models
│   ├── SidebarPage.ts           # Left sidebar (navigation, categories)
│   ├── NoteListPage.ts          # Middle column (note list, search)
│   ├── EditorPage.ts            # Right column (CodeMirror editor, toolbar)
│   ├── ContextMenuPage.ts       # Three-dots context menu
│   └── SettingsPage.ts          # Settings modal (preferences, data)
├── tests/
│   └── e2e/                     # Test suites by feature
│       ├── notes/               # Note CRUD + context menu
│       ├── categories/          # Category management
│       ├── favorites/           # Favorites
│       ├── search/              # Search
│       ├── trash/               # Trash and restore
│       └── settings/            # Settings modal
├── helpers/
│   ├── allureLabels.ts          # Allure metadata helpers
│   └── localStorage.ts          # App state management for test isolation
├── fixtures.ts                  # Playwright fixtures with POM injection
├── logger.ts                    # Winston structured logger
├── playwright.config.ts         # Playwright configuration
├── Dockerfile                   # Containerized test runner with Allure
├── Makefile                     # Docker build and run shortcuts
└── package.json
```

## Test Coverage

| Feature | Tests |
|---------|-------|
| **Notes CRUD** | Creates a new note · Typed content appears in editor · Delete via toolbar removes note · Creating 3 notes yields count of 3 |
| **Context Menu** | Three-dots menu opens · All 4 options present · Move to trash · Favorite via menu · Menu closes after selection |
| **Trash** | Delete via toolbar · Delete via menu · Restore from Trash · Trashed note absent from Notes · Delete 2 of 3 leaves 2 in Trash |
| **Search** | Filters to matching notes · No match shows empty list · Clear restores full list |
| **Favorites** | Via toolbar · Via menu · Only favorited note appears · Un-favorite removes it |
| **Categories** | Create appears in sidebar · Multiple categories · Input closes after submission |
| **Settings** | Panel opens · Data tab buttons visible · Markdown preview toggle · Dark mode toggle |
| **Total** | **27 tests** |

## Page Object Models

| POM | Region | Key Locators |
|-----|--------|--------------|
| `SidebarPage` | Left sidebar | `createNoteButton`, `notesLink`, `favoritesLink`, `trashLink`, `addCategoryButton` |
| `NoteListPage` | Note list | `searchInput`, `noteItems` (`[data-testid^="note-list-item"]`), `noteOptionsButtons` |
| `EditorPage` | Editor panel | `editorArea` (`.CodeMirror`), `favoriteButton`, `moveToTrashButton`, `settingsButton` |
| `ContextMenuPage` | Context menu | `favoriteOption`, `trashOption`, `restoreFromTrashButton`, `deletePermanentlyButton` |
| `SettingsPage` | Settings modal | `darkModeToggle`, `markdownPreviewToggle`, `dataManagementTab`, `downloadAllButton` |

## Installation

```bash
# Install dependencies
npm ci

# Install Playwright browsers
npx playwright install --with-deps chromium
```

## Running Tests

```bash
# Run all tests (headless)
npm test

# Run all tests with browser visible
npm run test:headed

# Run a specific feature
npx playwright test tests/e2e/notes
npx playwright test tests/e2e/trash

# Open Playwright UI mode
npx playwright test --ui
```

## Allure Report

```bash
# Generate report from latest results
npm run report

# Open the generated report in browser
npm run report:open

# Generate + serve in one command
npm run report:serve
```

## Docker

```bash
make run
```

Builds the image, runs all tests, generates the Allure report with historical trends, and serves it at `http://localhost:5050`. History is persisted in `.allure-history/` between runs.

## CI

The `e2e.yml` workflow runs on every push and pull request:

1. Installs Node 20 dependencies
2. Installs Playwright Chromium with system dependencies
3. Runs the full test suite
4. Generates the Allure report (`npm run report`)
5. Uploads the report as a downloadable workflow artifact (retained 30 days)

The Allure report artifact is uploaded even when tests fail, so failures are always diagnosable from CI.

## Design Notes

**Why E2E only?** TakeNote has no backend API — all state lives in `localStorage`. E2E is the only meaningful test layer for this architecture.

**Why the public demo?** Tests target `https://takenote.dev/app`. Each test clears `localStorage` before running, so isolation is guaranteed regardless of prior state or parallel workers.

**Why Allure?** Playwright's HTML reporter is great for local debugging. Allure adds step-level detail, screenshots, trace links, and trend graphs across CI runs — better for stakeholder communication.

**CodeMirror interaction:** The editor is CodeMirror, which renders a hidden `<textarea>` overlaid by its own render layer. Clicks must target `.CodeMirror` (the container), not the textarea directly. Content is typed via `page.keyboard.type()` after clicking the container.

**TakeNote default note:** TakeNote seeds a "Welcome to TakeNote!" note on every fresh `localStorage`. Tests account for this: the welcome note is always present at index 0, and count assertions use it as a known baseline.

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `BASE_URL` | `https://takenote.dev/app` | Target application URL |
| `CI` | — | Auto-detected; enables retries and headless mode |
| `LOG_LEVEL` | `info` | Winston verbosity (`debug` / `info` / `warn` / `error`) |

## Requirements

- Node.js 20+
- Chromium (via `npx playwright install chromium`)
- Docker (optional, for containerized execution)
