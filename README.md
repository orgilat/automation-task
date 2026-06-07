# TakeNote QA Suite

End-to-end Playwright + TypeScript test suite for [TakeNote](https://github.com/taniarascia/takenote), an open-source notes application. Tests run against the public demo at `https://takenote.dev`.

## Why this design

TakeNote is a client-side React app with no backend API — all state lives in `localStorage`. There is no API surface to test directly, so this suite is E2E-only, with `localStorage` inspection as the persistence-verification layer. Where a real backend existed, an API-test layer would sit alongside this one.

## Architecture at a glance

```
takenote-qa-suite/
├── pages/              # Page Object Models — one class per UI region
├── tests/
│   └── e2e/            # E2E specs organized by feature area
│       ├── notes/      # Note CRUD
│       ├── categories/ # Category management
│       ├── search/     # Search
│       ├── favorites/  # Favorites
│       ├── trash/      # Trash + restore
│       ├── persistence/# localStorage survives reload
│       └── settings/   # Theme, preview toggle
├── helpers/            # Shared test utilities
├── fixtures.ts         # Single source of truth for test setup
├── agents/             # Multi-agent build pipeline (Anthropic SDK)
│   ├── core/           # Agent runner and tool definitions
│   ├── context/        # Conventions and app knowledge agents read
│   ├── specialists/    # Individual agent implementations
│   └── orchestrator.ts # Pipeline runners
└── .github/workflows/  # CI: playwright.yml + ai-failure-analysis.yml
```

## Quick start

### Run with npm (fastest)

```bash
npm install
npx playwright install --with-deps chromium
cp .env.example .env
npm test
```

### Run with Docker

```bash
docker compose run --rm tests
docker compose up allure       # report at http://localhost:5050
```

### Run with UI mode

```bash
npm run test:ui
```

### Generate Allure report

```bash
npm run report
npm run report:open
```

## CI

The CI is split into **two independent GitHub Actions workflows**:

- **`playwright.yml`** — runs the test suite on chromium, uploads artifacts, builds and deploys the Allure report to GitHub Pages with full historical trends.
- **`ai-failure-analysis.yml`** — a completely separate workflow that listens to the test workflow via `workflow_run` and runs **only when tests fail**. It downloads the Allure artifact from the failed run, produces a minimal per-failure analysis (likely cause + suggested fix), and posts it as a sticky PR comment. Nothing runs on green builds — zero AI cost on healthy runs.

This separation is deliberate. Either workflow can be deleted without affecting the other. The AI layer is a feature, not a dependency.

Firefox and WebKit projects are configured in `playwright.config.ts` and can be enabled by adding the corresponding `projects` entries back — the suite is browser-agnostic by design.

## The agent pipeline (optional tooling)

This project ships with a custom multi-agent build pipeline that generates tests, POMs, and configs using the Anthropic SDK. The architecture mirrors a real engineering team — each agent has a focused role.

This is included as a demonstration of the build approach. The tests themselves stand alone and require no AI to run.

### Pipeline commands

```bash
npm run agents:bootstrap     # First-time scaffold from input.yaml
npm run agents                # Add a new test/POM
npm run agents:edit           # Edit an existing test
npm run agents:fix            # Surgical fix (fix-input.yaml)
npm run agents:yaml "..."     # Generate input.yaml from natural language
npm run agents:rollback       # Revert pipeline changes
```

The pipeline requires `ANTHROPIC_API_KEY` in `.env`. The tests do not.

## Environment variables

| Var                 | Default                | Purpose                         |
| ------------------- | ---------------------- | ------------------------------- |
| `BASE_URL`          | `https://takenote.dev` | App under test                  |
| `ANTHROPIC_API_KEY` | —                      | Agent pipeline + CI AI analysis |
| `SLACK_WEBHOOK_URL` | —                      | Optional CI notifications       |
| `LOG_LEVEL`         | `info`                 | Winston logger verbosity        |

## Test scope

Roughly 30 E2E tests organized by feature area under `tests/e2e/`:

- **Notes** (~6): create, edit, auto-save, delete, restore, validation
- **Categories** (~4): create, rename, delete, assign notes
- **Favorites** (~3): add, remove, filter view
- **Search** (~3): match, no-match, clear
- **Trash** (~4): move to trash, restore, permanent delete
- **Persistence** (~5): localStorage survives reload, state shape checks
- **Settings** (~5): theme toggle, markdown preview, etc.

Each test has Allure metadata, structured Winston logging, and clean POM-based interactions. No raw `page.locator()` in spec files.

Tests run in parallel on **5 workers** for speed — the full suite completes in roughly 60-90 seconds locally and in CI.

## Notes for the reviewer

- The suite intentionally has no API-level tests — TakeNote has no backend.
- Tests assume the public demo at `takenote.dev`. To run locally against a self-hosted instance, set `BASE_URL` and start TakeNote per its README.
- The agent pipeline is included as a separate concern in `agents/`. The Playwright suite has zero runtime dependency on it.
