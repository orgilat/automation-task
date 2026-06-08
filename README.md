# TakeNote QA Suite

A comprehensive end-to-end test suite for the [TakeNote](https://github.com/taniarascia/takenote) note-taking application, built with Playwright, TypeScript, and an integrated multi-agent CI/CD pipeline powered by Claude. This suite demonstrates advanced QA engineering patterns including Page Object Models, custom fixtures, Allure reporting with historical trends, AI-driven failure analysis, and an autonomous agent system that generates, validates, and self-heals tests.

## Architecture

```
takenote-qa-suite/
├── .github/workflows/
│   ├── playwright.yml              # CI workflow: runs tests, generates Allure report with history
│   └── ai-failure-analysis.yml     # Post-failure workflow: AI analyzes failures, posts to PR + Slack
├── agents/
│   ├── context/
│   │   ├── patterns.md             # Test suite coding standards and conventions
│   │   ├── app-context.md          # TakeNote app architecture and user flows
│   │   └── pages.md                # POM registry with locators and method signatures
│   ├── specialists/
│   │   ├── cleanCodeAgent.ts       # Enforces patterns.md rules, removes waitForTimeout
│   │   ├── failureAnalyzerAgent.ts # Analyzes Allure results, generates AI failure report
│   │   ├── testBuilderAgent.ts     # Generates test specs from natural language
│   │   ├── locatorAgent.ts         # Reads DOM, creates POMs, registers fixtures
│   │   ├── validationAgent.ts      # Runs tests, captures errors
│   │   ├── debugAgent.ts           # Self-heals failing tests
│   │   ├── tsCompilerAgent.ts      # TypeScript validation
│   │   ├── onlyCleanupAgent.ts     # Strips test.only markers before commit
│   │   ├── summaryAgent.ts         # Pipeline execution summary
│   │   └── prAgent.ts              # Git commit and push automation
│   ├── bootstrapOrchestrator.ts    # Full pipeline: scrape → POMs → tests → validate → debug
│   ├── editOrchestrator.ts         # Edit existing tests, skip POM generation
│   ├── fixOrchestrator.ts          # Targeted fix for specific files
│   └── input.yaml                  # Agent input: test description, POMs, tags
├── pages/
│   ├── SidebarPage.ts              # Left sidebar: navigation, categories
│   ├── NoteListPage.ts             # Middle column: note list, search
│   ├── EditorPage.ts               # Right column: CodeMirror editor, toolbar
│   ├── ContextMenuPage.ts          # Three-dots context menu
│   └── SettingsPage.ts             # Settings modal with tabs
├── tests/e2e/
│   ├── notes/
│   │   ├── notes.spec.ts           # Note CRUD operations
│   │   └── context-menu.spec.ts    # Context menu interactions
│   ├── categories/
│   │   └── categories.spec.ts      # Category creation
│   ├── search/
│   │   └── search.spec.ts          # Search filtering
│   ├── favorites/
│   │   └── favorites.spec.ts       # Favorite/unfavorite flows
│   └── trash/
│       └── trash.spec.ts           # Delete and restore operations
├── helpers/
│   ├── allureLabels.ts             # Allure metadata: layer, suite, severity
│   ├── localStorage.ts             # TakeNote state management helpers
│   └── waitForApp.ts               # App readiness check for public demo
├── fixtures.ts                      # Custom Playwright fixtures: cleanPage, all POMs
├── playwright.config.ts             # Playwright config: Allure reporter, baseURL, viewport
├── logger.ts                        # Winston logger: console + file transport
├── Dockerfile                       # mcr.microsoft.com/playwright + Allure CLI
├── Makefile                         # Docker build and run with history volume
├── run-tests.sh                     # Entrypoint: restore history → test → generate → serve
└── package.json                     # Scripts: test, agents, report, format, typecheck
```

## Test Coverage

| Feature          | Test Count | Tests                                                                                                                                                                                                                                                                    |
|------------------|------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Notes CRUD**   | 6          | Creates a new note<br>New note opens with empty editor<br>Typed content appears in editor<br>Delete via toolbar removes note from list<br>Note list shows first line of content<br>Creating 3 notes yields count of 3                                                  |
| **Context Menu** | 5          | Three-dots menu opens on click<br>All 4 menu options are present<br>Move to trash via menu<br>Favorite via menu<br>Menu closes after selecting an option                                                                                                               |
| **Categories**   | 3          | Create a category appears in sidebar<br>Create multiple categories independently<br>Category input closes after submission                                                                                                                                              |
| **Search**       | 4          | Search filters to matching notes<br>Search with no match shows empty list<br>Clearing search restores full list<br>Search input retains typed value                                                                                                                    |
| **Favorites**    | 4          | Favorite via toolbar appears in Favorites<br>Favorite via menu appears in Favorites<br>Only favorited note appears in Favorites<br>Un-favorite removes note from Favorites                                                                                              |
| **Trash**        | 5          | Delete via toolbar sends note to Trash<br>Delete via menu sends note to Trash<br>Restore from Trash returns note to Notes<br>Trashed note absent from Notes view<br>Delete 2 of 3 notes leaves 2 in Trash                                                             |
| **Total**        | **27**     | All E2E flows covered                                                                                                                                                                                                                                                    |

## Page Object Models

| POM                | UI Region                | Key Locators                                                                                                | Methods                                                                                                                                                           |
|--------------------|--------------------------|-------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **SidebarPage**    | Left sidebar             | `createNoteButton`, `scratchpadLink`, `notesLink`, `favoritesLink`, `trashLink`, `addCategoryButton`       | `createNote(content?)`, `goToScratchpad()`, `goToNotes()`, `goToFavorites()`, `goToTrash()`, `createCategory(name)`, `toggleCategoryList()`                     |
| **NoteListPage**   | Middle column note list  | `searchInput`, `noteItems`, `noteOptionsButtons`, `noteTitles`                                              | `search(query)`, `clearSearch()`, `getNoteAt(index)`, `getNoteTitleAt(index)`, `getNoteCount()`, `openNoteOptions(index)`, `selectNoteAt(index)`                |
| **EditorPage**     | Right column editor      | `editorArea`, `editorTextarea`, `previewToggle`, `favoriteButton`, `moveToTrashButton`, `settingsButton`   | `typeContent(text)`, `clearContent()`, `getContent()`, `togglePreview()`, `toggleFavorite()`, `deleteNote()`, `openSettings()`                                   |
| **ContextMenuPage**| Three-dots menu          | `favoriteOption`, `trashOption`, `downloadOption`, `restoreFromTrashButton`, `deletePermanentlyButton`     | `favorite()`, `moveToTrash()`, `download()`, `restoreFromTrash()`, `deletePermanently()`                                                                         |
| **SettingsPage**   | Settings modal           | `preferencesTab`, `darkModeToggle`, `markdownPreviewToggle`, `downloadAllButton`, `exportBackupButton`     | `goToPreferences()`, `goToDataManagement()`, `toggleDarkMode()`, `toggleMarkdownPreview()`, `downloadAll()`, `exportBackup()`, `selectSortBy(option)`           |

All POMs use Playwright's auto-waiting locators (`getByRole`, `getByTestId`, `getByText`) with zero explicit waits except where TakeNote's search debounce requires a brief settle period.

## Agent Pipeline

This project includes a multi-agent system that autonomously generates, validates, and maintains tests using Claude Sonnet 4. The pipeline operates in three modes:

### Orchestrators

| Orchestrator            | Purpose                                                                 | Command                  |
|-------------------------|-------------------------------------------------------------------------|--------------------------|
| **bootstrapOrchestrator** | Full pipeline: scrape DOM → generate POMs → register fixtures → write tests → validate → debug → commit | `npm run agents:bootstrap` |
| **editOrchestrator**      | Edit existing tests without POM generation (faster iteration)         | `npm run agents:edit`    |
| **fixOrchestrator**       | Targeted fix for specific failing tests                                | `npm run agents:fix`     |

### Specialist Agents

Each specialist agent has a focused responsibility:

1. **onlyCleanupAgent** — Strips `test.only` and `describe.only` markers before commit to prevent CI from running subset tests
2. **locatorAgent** — Reads `raw-locators.yaml` (scraped DOM), generates POM classes with typed locators, registers them in `fixtures.ts`, updates `agents/context/pages.md`
3. **testBuilderAgent** — Takes natural language description from `agents/input.yaml`, generates spec files following `patterns.md` conventions, uses POMs from context
4. **cleanCodeAgent** — Enforces every rule in `patterns.md`: no inline locators, no `page.waitForTimeout()`, max 15 lines per test, Allure metadata required
5. **tsCompilerAgent** — Runs `tsc --noEmit` on changed files, fails pipeline if type errors exist
6. **validationAgent** — Executes `npx playwright test` on generated specs, captures stdout and error logs
7. **debugAgent** — Reads test failures, applies fixes (locator adjustments, timing issues, state management), reruns until pass or max retries
8. **summaryAgent** — Prints pipeline execution report: files created, clean code violations, test results
9. **prAgent** — Stages changes, commits with semantic message, pushes to origin
10. **failureAnalyzerAgent** — Reads Allure JSON results, sends failures to Claude for root cause analysis, posts Markdown report to PR comments and Slack

### Usage

```bash
# Generate new tests from natural language
npm run agents:bootstrap
# Edit agents/input.yaml with your test description, then run

# Edit existing tests
npm run agents:edit

# Fix specific failing tests
npm run agents:fix
# Edit agents/fix-input.yaml with file paths and error description

# Run individual agents
npm run agents:clean       # Clean code check only
npm run agents:github      # Git commit + push only
npm run scrape             # Scrape locators from live app
```

### CI Integration

The **ai-failure-analysis.yml** workflow runs automatically when `playwright.yml` fails:

1. Downloads Allure results artifact from failed run
2. Parses JSON for failed test cases
3. Sends each failure to Claude with error message, stack trace, and test context
4. Generates Markdown report with "Likely Cause" and "Suggested Fix" for each failure
5. Posts report as a sticky PR comment
6. Sends summary to Slack via webhook (if `SLACK_WEBHOOK_URL` secret is set)

This provides instant, contextualized failure analysis without manual log inspection.

## CI/CD

### Playwright Tests Workflow (`playwright.yml`)

**Triggers:** Push to `main`, pull requests, manual dispatch

**Steps:**
1. Checkout code
2. Setup Node.js 20 with npm cache
3. Install dependencies (`npm ci`)
4. Install Chromium with system deps (`npx playwright install --with-deps chromium`)
5. Run tests (`npx playwright test --project=chromium`)
6. Upload `allure-results/` as artifact (always, even on failure)
7. **Allure Report with History:**
   - Checkout `gh-pages` branch into separate directory
   - Download test results artifact
   - Generate Allure report with `simple-elf/allure-report-action@master`
   - Merge with historical data from previous runs (keeps last 30 reports)
   - Publish to GitHub Pages at `https://<username>.github.io/<repo>/`

**Allure Report URL:** https://orgilat.github.io/automation-task/

### AI Failure Analysis Workflow (`ai-failure-analysis.yml`)

**Triggers:** When `Playwright Tests` workflow completes with `failure` status

**Steps:**
1. Checkout code
2. Setup Node.js 20
3. Install dependencies
4. Download `allure-results` artifact from triggering workflow run
5. Run `npm run ci:analyze-failures` → executes `failureAnalyzerAgent.ts`
6. Agent parses Allure JSON, sends failures to Claude Sonnet 4 for analysis
7. Posts Markdown report as sticky PR comment (if triggered by PR)
8. Sends Slack notification with failure count and run URL (if `SLACK_WEBHOOK_URL` configured)

**Required Secrets:**
- `ANTHROPIC_API_KEY` — Claude API key (required for AI analysis)
- `SLACK_WEBHOOK_URL` — Slack incoming webhook (optional)

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
npm test tests/e2e/notes/

# Run with UI mode
npm run test:ui

# Run headed (see browser)
npm run test:headed

# Debug mode
npm run test:debug

# Generate and open Allure report
npm run report
npm run report:open

# Or serve report directly from results
npm run report:serve
```

### Docker Execution

```bash
# Build and run (mounts history volume for trend graphs)
make run

# Or manually:
docker build -t takenote-tests .
docker run --rm -p 5050:5050 \
  -v $(pwd)/.allure-history:/app/allure-history \
  -e BASE_URL=https://takenote.dev/app \
  takenote-tests

# Access report at http://localhost:5050
```

The Docker setup automatically:
- Restores Allure history from `.allure-history/` volume for trend graphs
- Runs the full test suite
- Generates Allure report
- Persists history for next run
- Serves the report on port 5050

### Run Specific Test Tags

```bash
# Run only favorites tests
npm test -- --grep @favorites

# Run only search tests
npm test -- --grep @search

# Run only trash tests
npm test -- --grep @trash
```

## Design Decisions

### 1. E2E-Only Strategy

TakeNote has **no backend API**. All state lives in browser `localStorage` with optional GitHub Gist sync (which we don't test due to OAuth complexity). This architectural constraint makes E2E testing the only viable approach. The alternative—mocking a non-existent API—would test nothing but our own mocks.

**Trade-off accepted:** E2E tests are slower than API tests, but here they're the ground truth.

### 2. Public Demo as Test Target

We test against `https://takenote.dev/app` (the official demo) rather than a self-hosted instance. This decision prioritizes:

- **Reviewer simplicity:** Zero setup required to run tests
- **Isolation:** Every test starts with `cleanPage` fixture that clears `localStorage`, providing full state reset
- **Real-world conditions:** The demo is the canonical TakeNote build

**Mitigations for demo reliability:**
- `waitForAppReady()` helper tolerates cold starts and network instability
- CI retries: 2 automatic retries on failure (configured in `playwright.config.ts`)
- Docker: option to test against any URL via `BASE_URL` env var

### 3. Multi-Agent Pipeline

The agent system is not a gimmick—it demonstrates **engineering depth beyond manual testing**:

- **Consistency:** Every test follows `patterns.md` conventions (enforced by `cleanCodeAgent`)
- **Scalability:** Adding 20 tests takes one YAML edit, not hours of copy-paste
- **Self-healing:** `debugAgent` fixes locator drift and timing issues automatically
- **Knowledge capture:** `agents/context/` is living documentation that agents and humans read

This is the kind of automation maturity expected in modern QA engineering.

### 4. Allure with Historical Trends

We use Allure instead of Playwright's HTML reporter because:

- **Trend graphs:** The GitHub Pages workflow preserves history across runs, showing flake patterns and success rates over time
- **Test metadata:** Allure's `suite`, `subSuite`, `component`, `severity` labels enable powerful filtering and executive dashboards
- **Attachments:** Screenshots and videos embed directly in the report timeline
- **CI integration:** GitHub Pages publishes every run, creating a persistent report URL

### 5. The `cleanPage` Fixture

TakeNote's demo includes a default "Welcome" note. If we used raw `page`, every test would see stale state. The `cleanPage` fixture:

1. Navigates to `/app`
2. Waits for app ready (title, DOM load, network idle)
3. Clears `localStorage` and `sessionStorage`
4. Reloads to apply clean state
5. Waits again to ensure UI reflects empty state

This fixture is **mandatory** for all E2E tests (enforced by `cleanCodeAgent`). It's the contract that makes parallel execution and test isolation possible.

## Environment Variables

| Variable            | Required | Default                    | Description                                      |
|---------------------|----------|----------------------------|--------------------------------------------------|
| `BASE_URL`          | No       | `https://takenote.dev/app` | TakeNote app URL (override for local/staging)    |
| `CI`                | No       | (auto-set by GitHub)       | Enables CI-specific behaviors (retries, workers) |
| `ANTHROPIC_API_KEY` | Yes*     | —                          | Claude API key for agent pipeline                |
| `SLACK_WEBHOOK_URL` | No       | —                          | Slack webhook for failure notifications          |
| `LOG_LEVEL`         | No       | `info`                     | Winston log level: `debug`, `info`, `warn`, `error` |

*Required only for agent commands (`npm run agents:*`) and CI failure analysis.

## Requirements

- **Node.js:** >= 20.0.0 (see `package.json` engines field)
- **Docker:** Any recent version (for containerized execution)
- **Chromium:** Installed automatically by `npx playwright install --with-deps chromium`
- **Anthropic API Key:** Required for agent pipeline (set `ANTHROPIC_API_KEY` in `.env`)

## Scripts Reference

| Command                  | Description                                                      |
|--------------------------|------------------------------------------------------------------|
| `npm test`               | Run all tests                                                    |
| `npm run test:e2e`       | Run E2E tests only                                               |
| `npm run test:headed`    | Run tests in headed mode (visible browser)                       |
| `npm run test:ui`        | Open Playwright UI mode                                          |
| `npm run test:debug`     | Run with Playwright Inspector                                    |
| `npm run report`         | Generate Allure report                                           |
| `npm run report:open`    | Open existing Allure report                                      |
| `npm run report:serve`   | Generate and serve Allure report                                 |
| `npm run agents:bootstrap` | Full agent pipeline: POMs + tests + validate                   |
| `npm run agents:edit`    | Edit existing tests (skip POM generation)                        |
| `npm run agents:fix`     | Fix specific failing tests                                       |
| `npm run agents:clean`   | Run clean code agent only                                        |
| `npm run scrape`         | Scrape locators from live app                                    |
| `npm run typecheck`      | Run TypeScript compiler (no emit)                                |
| `npm run lint`           | Run ESLint                                                       |
| `npm run lint:fix`       | Fix ESLint errors automatically                                  |
| `npm run format`         | Format all files with Prettier                                   |
| `npm run format:check`   | Check formatting without changes                                 |

## Continuous Improvement

This suite is designed for growth:

- **Add new POMs:** Update `agents/context/pages.md`, rerun `npm run agents:bootstrap`
- **Add new tests:** Edit `agents/input.yaml`, run `npm run agents:edit`
- **Fix flaky tests:** The agent pipeline tracks failures and suggests fixes
- **Expand coverage:** Scrape new locators (`npm run scrape`), update YAML, regenerate POMs

The agent context files (`patterns.md`, `app-context.md`, `pages.md`) are the source of truth. Keep them updated, and the agents will maintain consistency.

---

**Built with:** Playwright • TypeScript • Claude Sonnet 4 • Allure • Docker • GitHub Actions

**Author:** Or  
**License:** MIT
