# TakeNote QA Suite

A comprehensive end-to-end test suite for the [TakeNote](https://takenote.dev) open-source notes application, featuring a multi-agent build pipeline powered by Anthropic Claude. This project demonstrates advanced test automation with Playwright, TypeScript, Page Object Model architecture, and an AI-driven workflow that writes, validates, and self-corrects test code.

## Architecture

```
takenote-qa-suite/
├── .github/
│   └── workflows/
│       ├── playwright.yml                 # Main CI pipeline with Allure history
│       └── ai-failure-analysis.yml        # Post-failure AI analysis workflow
├── agents/                                # Multi-agent build system
│   ├── context/                           # Agent knowledge base
│   │   ├── app-context.md                 # TakeNote app architecture and flows
│   │   ├── pages.md                       # POM registry and method documentation
│   │   └── patterns.md                    # Code conventions and rules
│   ├── specialists/                       # Individual agent modules
│   │   ├── cleanCodeAgent.ts              # Enforces patterns.md compliance
│   │   └── failureAnalyzerAgent.ts        # Claude-powered test failure analysis
│   └── bootstrapOrchestrator.ts           # Orchestrates test creation pipeline
├── helpers/
│   └── allureLabels.ts                    # Allure metadata utilities
├── pages/                                 # Page Object Models
│   ├── SidebarPage.ts                     # Left sidebar (navigation, categories)
│   ├── NoteListPage.ts                    # Middle column (note list, search)
│   ├── EditorPage.ts                      # Right column (CodeMirror editor, toolbar)
│   ├── ContextMenuPage.ts                 # Note context menu (three-dots)
│   └── SettingsPage.ts                    # Settings modal (preferences, data)
├── tests/
│   └── e2e/                               # End-to-end test suites
│       ├── categories/                    # Category CRUD tests
│       ├── favorites/                     # Favorites management tests
│       ├── notes/                         # Note creation and context menu tests
│       ├── search/                        # Search filter tests
│       ├── settings/                      # Settings modal tests
│       └── trash/                         # Trash and restore tests
├── Dockerfile                             # Containerized test runner with Allure
├── Makefile                               # Docker build and run shortcuts
├── fixtures.ts                            # Playwright fixtures with POM injection
├── logger.ts                              # Winston structured logging
├── playwright.config.ts                   # Playwright configuration
├── run-tests.sh                           # Docker entrypoint (tests + Allure server)
└── package.json                           # Dependencies and agent commands
```

## Test Coverage

| Feature | Test Count | Tests |
|---------|------------|-------|
| **Notes CRUD** (`notes.spec.ts`) | 4 | Creates a new note<br>Typed content appears in editor<br>Delete via toolbar removes note from list<br>Creating 3 notes yields count of 3 |
| **Note Context Menu** (`context-menu.spec.ts`) | 3 | Three-dots menu opens on click<br>All 4 menu options are present<br>Menu closes after selecting an option |
| **Trash** (`trash.spec.ts`) | 4 | Delete via menu sends note to Trash<br>Restore from Trash returns note to Notes<br>Trashed note absent from Notes view<br>Delete 2 of 3 notes leaves 2 in Trash |
| **Search** (`search.spec.ts`) | 3 | Search filters to matching notes<br>Search with no match shows empty list<br>Clearing search restores full list |
| **Favorites** (`favorites.spec.ts`) | 3 | Favorite via toolbar appears in Favorites<br>Only favorited note appears in Favorites<br>Un-favorite removes note from Favorites |
| **Categories** (`categories.spec.ts`) | 3 | Create a category appears in sidebar<br>Create multiple categories independently<br>Category input closes after submission |
| **Settings** (`settings.spec.ts`) | 4 | Settings panel opens<br>Data tab shows Download and Export buttons<br>Markdown preview toggle is interactive<br>Dark mode toggle is interactive |
| **Total** | **24** | Comprehensive coverage of TakeNote's core features |

## Page Object Models

| POM | UI Region | Key Locators | Methods |
|-----|-----------|--------------|---------|
| **SidebarPage** | Left sidebar navigation | `createNoteButton` (getByRole 'Create new note')<br>`notesLink` (getByRole 'Notes')<br>`favoritesLink` (getByRole 'Favorites')<br>`trashLink` (getByRole 'Trash')<br>`addCategoryButton` (getByRole 'Add category')<br>`newCategoryInput` (getByTestId 'new-category-label') | `createNote(content)`<br>`goToNotes()`<br>`goToFavorites()`<br>`goToTrash()`<br>`createCategory(name)`<br>`toggleCategoryList()` |
| **NoteListPage** | Middle column note list | `searchInput` (getByTestId 'note-search')<br>`noteItems` (locator '[data-testid^="note-list-item"]')<br>`noteOptionsButtons` (locator '[data-testid^="note-options-div"]')<br>`noteTitles` (locator '[data-testid^="note-title"]') | `search(query)`<br>`clearSearch()`<br>`getNoteAt(index)`<br>`getNoteTitleAt(index)`<br>`getNoteCount()`<br>`openNoteOptions(index)`<br>`selectNoteAt(index)` |
| **EditorPage** | Right column editor | `editorArea` (locator '.CodeMirror')<br>`editorTextarea` (locator '.CodeMirror textarea')<br>`favoriteButton` (getByRole 'Add note to favorites')<br>`moveToTrashButton` (getByRole 'Delete note')<br>`settingsButton` (getByRole 'settings') | `typeContent(text)`<br>`clearContent()`<br>`getContent()`<br>`togglePreview()`<br>`toggleFavorite()`<br>`deleteNote()`<br>`openSettings()` |
| **ContextMenuPage** | Right-click context menu | `favoriteOption` (getByTestId 'note-option-favorite')<br>`trashOption` (getByTestId 'note-option-trash')<br>`downloadOption` (getByTestId 'note-option-download')<br>`restoreFromTrashButton` (getByText 'Restore from trash') | `favorite()`<br>`moveToTrash()`<br>`download()`<br>`restoreFromTrash()`<br>`deletePermanently()` |
| **SettingsPage** | Settings modal | `preferencesTab` (getByRole 'Preferences')<br>`dataManagementTab` (getByRole 'Data management')<br>`darkModeToggle` (getByTestId 'dark-mode-toggle')<br>`markdownPreviewToggle` (getByTestId 'markdown-preview-toggle')<br>`downloadAllButton` (getByTestId 'settings-modal-download-notes') | `goToPreferences()`<br>`goToDataManagement()`<br>`toggleDarkMode()`<br>`toggleMarkdownPreview()`<br>`downloadAll()`<br>`exportBackup()` |

## Agent Pipeline

The project includes a sophisticated multi-agent system that writes, validates, and maintains test code using Anthropic's Claude API. This demonstrates advanced software engineering beyond traditional test automation.

### Core Orchestrators

- **BootstrapOrchestrator** (`bootstrapOrchestrator.ts`) — End-to-end test generation pipeline: reads POM registry → generates test specs → validates → debugs → commits to Git.
- **EditOrchestrator** — Modifies existing tests based on YAML instructions.
- **FixOrchestrator** — Repairs failing tests by analyzing error messages and applying fixes.

### Specialist Agents

- **CleanCodeAgent** (`cleanCodeAgent.ts`) — Enforces project conventions from `patterns.md`: removes forbidden patterns (raw `page.locator()` calls, function definitions in specs, `waitForTimeout()`), ensures Allure metadata, refactors bloated test bodies.
- **FailureAnalyzerAgent** (`failureAnalyzerAgent.ts`) — Runs post-CI failure analysis: parses Allure JSON results → sends failure context to Claude → generates human-readable diagnosis with likely cause and suggested fix → posts to Slack and PR comments.
- **LocatorAgent** — Converts raw DOM structure into Page Object Models and registers them in `fixtures.ts`.
- **TestBuilderAgent** — Writes test specs based on user story descriptions and POM method signatures.
- **TsCompilerAgent** — Validates TypeScript compilation before committing test code.
- **ValidationAgent** — Runs `playwright test` and captures errors for debugging loop.
- **DebugAgent** — Reads test failures, modifies code to fix them, re-runs until passing.
- **OnlyCleanupAgent** — Strips `.only` markers before pushing to ensure full suite runs in CI.
- **PrAgent** — Creates GitHub PR with test summary and coverage report.

### Commands

```bash
npm run agents:bootstrap    # Full pipeline: create tests from scratch
npm run agents:edit         # Edit existing tests via YAML instructions
npm run agents:fix          # Auto-repair failing tests
npm run agents:clean        # Enforce patterns.md on all spec files
npm run agents:github       # Push to GitHub and create PR
npm run ci:analyze-failures # Post-CI failure analysis (runs in GitHub Actions)
```

### CI Integration

The **ai-failure-analysis.yml** workflow triggers on test failure, downloads Allure results, and runs `FailureAnalyzerAgent` to post a diagnostic report as a PR comment and Slack notification. This turns cryptic Playwright errors into actionable insights.

## CI/CD

### Playwright Tests Workflow (`playwright.yml`)

**Triggers:** Push to `main`, pull requests, manual dispatch

**Steps:**
1. Checkout code
2. Install Node 20 with npm cache
3. Install Playwright Chromium with system dependencies
4. Run test suite (`npx playwright test --project=chromium`)
5. Upload Allure results as artifact
6. **Allure Report Generation** (separate job):
   - Restore previous report from `gh-pages` branch for trend history
   - Generate new report with `simple-elf/allure-report-action`
   - Publish to `gh-pages` branch (keeps last 30 reports)
   - **Live report URL:** `https://<username>.github.io/<repo>/`

### AI Failure Analysis Workflow (`ai-failure-analysis.yml`)

**Triggers:** When `Playwright Tests` workflow completes with `failure` status

**Steps:**
1. Download Allure JSON artifacts from failed workflow run
2. Install dependencies and run `npm run ci:analyze-failures`
3. `FailureAnalyzerAgent` parses failures → calls Claude API → generates analysis
4. Post markdown report as sticky PR comment using `marocchino/sticky-pull-request-comment`
5. (Optional) Send Slack notification with failure count and run URL

**Environment variables required:**
- `ANTHROPIC_API_KEY` — Claude API key for failure analysis
- `SLACK_WEBHOOK_URL` (optional) — For team notifications

## Quick Start

### Local Execution

```bash
# Install dependencies
npm ci

# Install Playwright browsers
npx playwright install --with-deps chromium

# Run all tests
npm test

# Run specific suite
npm run test:e2e

# Run with UI mode
npm run test:ui

# View Allure report
npm run report:serve
```

### Docker Execution

```bash
# Build and run (includes Allure server on http://localhost:5050)
make run

# Or manually:
docker build -t takenote-tests .
docker run --rm -p 5050:5050 \
  -v $(pwd)/.allure-history:/app/allure-history \
  takenote-tests
```

The Docker container:
1. Restores Allure history from mounted volume
2. Runs full test suite
3. Generates Allure report with trends
4. Serves report on port 5050
5. Persists history for next run

### Run Specific Tags

```bash
npx playwright test --grep @notes      # Only notes tests
npx playwright test --grep @search     # Only search tests
npx playwright test --grep @favorites  # Only favorites tests
```

## Design Decisions

### 1. Why E2E Only — No API Tests

TakeNote is a **client-side-only** application with **no backend API**. All state lives in browser `localStorage`. There is an optional GitHub Gist sync feature, but testing OAuth flows was out of scope. E2E tests with `localStorage` inspection provide the only verification layer available for this architecture.

### 2. Why Test the Public Demo URL

**Target:** `https://takenote.dev/app`

**Rationale:**
- **Isolation** — Every test starts with `await page.goto('/app')` and clears `localStorage`, ensuring a clean slate regardless of external users.
- **Simplicity** — No need to deploy a local instance, configure build pipelines, or manage test environments. The reviewer can run tests immediately.
- **Real-world conditions** — Tests validate the actual production build, catching issues that might not surface in a local dev server.

### 3. Why the Agent Pipeline

Most QA automation projects demonstrate testing skills. This project demonstrates **software engineering depth**:
- **Code generation** — Automating the boring parts of test writing (Allure metadata, POM wiring, TypeScript boilerplate).
- **Self-healing tests** — The debug agent reads error messages and modifies code to fix failures.
- **Enforced standards** — CleanCodeAgent prevents technical debt by rejecting non-compliant code before commit.
- **Advanced AI integration** — Shows practical LLM use beyond chatbots: structured outputs, tool use, multi-step reasoning.

This is not a "ChatGPT wrapper" — it's a production-grade pipeline that could scale to enterprise test suites.

### 4. Why Allure with History

Allure provides:
- **Trend analysis** — See flakiness patterns across 30 runs via `gh-pages` history storage.
- **Rich reports** — Steps, screenshots, traces, and metadata in a polished UI.
- **CI integration** — GitHub Actions publishes reports to `gh-pages`, making them permanently accessible.

Playwright's HTML reporter is excellent for local debugging, but Allure is unmatched for stakeholder communication.

### 5. Fixture Design — Handling TakeNote's Default Note

TakeNote creates a default "Welcome" note on first load. The `cleanPage` fixture (imported from `fixtures.ts`) navigates to `/app` and waits for the DOM to settle, giving tests a consistent starting state. This avoids flaky counts like "expected 1, got 2" when the welcome note interferes.

**Why not clear `localStorage` in the fixture?**
- TakeNote's state is lazily initialized. Clearing storage before navigation causes race conditions.
- Tests explicitly verify state changes (e.g., "count increased by 1"), so they're robust to initial state variance.

## Environment Variables

No environment variables are required for basic test execution. Optional configuration:

| Variable | Purpose | Required | Default |
|----------|---------|----------|---------|
| `BASE_URL` | Override TakeNote instance URL | No | `https://takenote.dev/app` |
| `CI` | Enables CI optimizations (retries, workers) | No | Auto-detected |
| `ANTHROPIC_API_KEY` | Claude API key for agent pipeline and failure analysis | For agents only | — |
| `SLACK_WEBHOOK_URL` | Slack webhook for CI failure notifications | No | — |
| `LOG_LEVEL` | Winston log level (`debug`, `info`, `warn`, `error`) | No | `info` |

## Requirements

- **Node.js** 20+ (engines enforced in `package.json`)
- **Docker** (optional, for containerized execution)
- **Chromium** (installed via `npx playwright install chromium`)
- **Anthropic API Key** (only required for agent commands like `npm run agents:bootstrap`)

---

**Built with:** Playwright 1.49 • TypeScript 5.7 • Allure 3.0 • Claude Sonnet 4.5 • Docker • GitHub Actions

**Repository:** [https://github.com/orgilat/automation-task](https://github.com/orgilat/automation-task)
