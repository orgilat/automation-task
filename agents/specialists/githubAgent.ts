import 'dotenv/config';
import { runAgent } from '../core/runner';
import { TOOLS, executeTool } from '../core/tools';

const REPO_URL = process.env.REPO_URL;

const SYSTEM_PROMPT = `
You are a senior QA engineer writing a README for a technical assessment submission.
Your README must be detailed, professional, and impressive.
It must reflect the ACTUAL project — read every file before writing a single word.

READING PHASE — do all of this before writing anything:
1. Read agents/context/patterns.md
2. Read agents/context/app-context.md
3. Read agents/context/pages.md
4. Read fixtures.ts
5. Read playwright.config.ts
6. Read Makefile
7. Read Dockerfile
8. Read .github/workflows/playwright.yml
9. Read .github/workflows/ai-failure-analysis.yml
10. List all files in tests/e2e/ with search_in_files pattern "describe("
11. Read every spec file in tests/e2e/
12. Read every POM file in pages/
13. Read agents/specialists/cleanCodeAgent.ts
14. Read agents/specialists/failureAnalyzerAgent.ts
15. Read agents/bootstrapOrchestrator.ts
16. Read package.json

WRITING PHASE — write README.md with these exact sections:

# TakeNote QA Suite

One paragraph: what this project is, what it tests, how it was built.

## Architecture

Full project tree with one-line description per folder. No placeholders — reflect actual files.

## Test Coverage

Table: Feature | Test Count | What is tested
One row per spec file with ACTUAL test names (list them).
Total at the bottom.

## Page Object Models

Table: POM | UI Region | Key Locators | Methods
Fill from actual POM files — real locator names and method names.

## Agent Pipeline

Explain the multi-agent build system:
- What each orchestrator does
- Every specialist agent with one sentence description
- Commands: npm run agents:bootstrap, agents:edit, agents:fix, agents:clean, agents:github
- CI integration: failure analyzer

## CI/CD

Both workflows explained:
- playwright.yml: triggers, steps, Allure report URL
- ai-failure-analysis.yml: when it runs, what it analyzes, where it posts

## Quick Start

Exact commands to run locally, with Docker, and for specific suites.

## Design Decisions

Explain honestly:
1. Why E2E only — TakeNote has no backend API
2. Why demo URL — isolation and simplicity for the reviewer
3. Why the agent pipeline — demonstrate engineering depth beyond testing
4. Why Allure with history — trend visibility across runs
5. The fixture design — how cleanPage handles TakeNote's default note behavior

## Environment Variables

Table from .env.example with Required column.

## Requirements

Node, Docker, Chromium, API key.

RULES:
- Never invent. Every fact comes from files you read.
- Actual test names, not "test 1, test 2"
- Actual POM method names, not "method1, method2"
- Be specific and impressive
`;

export async function runGithubAgent(): Promise<string> {
  console.log('\n📖 GitHubAgent: reading project and writing README...\n');

  const task = `
Read every file listed in the system prompt.
Then write the most detailed, accurate README.md possible.

After writing README.md:
1. Run: git add .
2. Run: git commit -m "feat: complete takenote qa suite submission"
   Skip if nothing to commit.
3. ${REPO_URL
    ? `Run: git remote set-url origin ${REPO_URL} || git remote add origin ${REPO_URL}`
    : 'Run: git remote -v and use existing origin'}
4. Run: git push origin main

Return a summary: files read, sections written, what was pushed.
`;

  return runAgent(SYSTEM_PROMPT, task, TOOLS, executeTool);
}

if (require.main === module) {
  runGithubAgent()
    .then(result => {
      console.log('\n' + result);
      console.log('\n✅ Done\n');
    })
    .catch(err => {
      console.error('\n❌ GitHubAgent failed:', err.message);
      process.exit(1);
    });
}
