import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import * as readline from 'readline';
import yaml from 'js-yaml';
import { runOnlyCleanupAgent } from './specialists/onlyCleanupAgent';
import { runLocatorAgent } from './specialists/locatorAgent';
import { runTestBuilderAgent } from './specialists/testBuilderAgent';
import { runCleanCodeAgent } from './specialists/cleanCodeAgent';
import { runTsCompilerAgent } from './specialists/tsCompilerAgent';
import { runValidationAgent } from './specialists/validationAgent';
import { runDebugAgent } from './specialists/debugAgent';
import { runSummaryAgent } from './specialists/summaryAgent';
import { runPrAgent } from './specialists/prAgent';
import { runOnlyCleanupAgent as stripOnly } from './specialists/onlyCleanupAgent';

interface InputYaml {
  description: string;
  pomsInvolved?: string[];
  tags?: string[];
  generateReport?: boolean;
  runDebug?: boolean;
}

function loadInput(): InputYaml {
  const inputPath = path.resolve(process.cwd(), 'agents/input.yaml');
  if (!fs.existsSync(inputPath)) {
    throw new Error('agents/input.yaml not found — fill it in and re-run');
  }
  return yaml.load(fs.readFileSync(inputPath, 'utf-8')) as InputYaml;
}

function waitForApproval(): Promise<void> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(
      '\n⏸  Pipeline paused. Review the tests above, then press ENTER to commit and push (or Ctrl+C to abort)...\n',
      () => {
        rl.close();
        resolve();
      },
    );
  });
}

async function main(): Promise<void> {
  const divider = '━'.repeat(55);

  console.log(`\n${divider}`);
  console.log('🚀 Bootstrap Orchestrator — TakeNote QA Suite');
  console.log(divider);

  const input = loadInput();
  const tags = input.tags || ['@e2e'];
  const pomsInvolved = input.pomsInvolved || [];
  const createdFiles: string[] = [];

  // ─── Step 0: Cleanup ──────────────────────────────────────
  console.log(`\n0️⃣  Cleaning stale .only markers...`);
  const cleanupResult = await runOnlyCleanupAgent();
  console.log(`   ${cleanupResult}`);

  // ─── Step 1: Read DOM → create POMs → register in fixtures ──
  console.log('🔍 Step 1: LocatorAgent (raw-locators.yaml → POMs → fixtures)...');
  const locatorResult = await runLocatorAgent();
  console.log(locatorResult);
  console.log('✅ POMs and fixtures ready\n');

  // ─── Step 2: Tests ────────────────────────────────────────
  console.log(`\n2️⃣  Building tests...`);
  const testResult = await runTestBuilderAgent({
    description: input.description,
    pomsInvolved,
    tags,
  });
  const testFiles = testResult
    .split('\n')
    .filter((l) => l.trim().endsWith('.spec.ts'))
    .map((l) => l.trim());
  createdFiles.push(...testFiles);
  console.log(`   Created: ${testFiles.join(', ') || 'none'}`);

  // ─── Step 3: Clean Code ───────────────────────────────────
  console.log(`\n3️⃣  Enforcing clean code...`);
  const cleanResult = await runCleanCodeAgent({ filePaths: createdFiles });

  // ─── Step 4: TypeScript ───────────────────────────────────
  console.log(`\n4️⃣  TypeScript check...`);
  const tsOk = await runTsCompilerAgent({ filePaths: createdFiles });
  if (!tsOk) {
    console.log(`   ❌ TypeScript errors — aborting`);
    process.exit(1);
  }

  // ─── Step 5: Validation ───────────────────────────────────
  console.log(`\n5️⃣  Running tests...`);
  const { passed, errorLog, stdout } = await runValidationAgent({ filePaths: testFiles });

  // ─── Step 6: Debug (if failed) ────────────────────────────
  let finalPassed = passed;
  if (!passed && input.runDebug !== false) {
    console.log(`\n6️⃣  Debug agent — attempting fix...`);
    finalPassed = await runDebugAgent({ filePaths: testFiles, errorLog, stdout });
  } else {
    console.log(`\n6️⃣  ${passed ? '✅ Tests passed — skipping debug' : '⚠️  Debug disabled'}`);
  }

  // ─── Step 7: Summary ──────────────────────────────────────
  console.log(`\n7️⃣  Pipeline summary`);
  runSummaryAgent({
    testFiles,
    cleanCode: cleanResult,
    validationPassed: finalPassed,
    errorLog,
    stdout,
  });

  // ─── Step 8: Approval ─────────────────────────────────────
  await waitForApproval();

  // ─── Step 9: Strip .only ──────────────────────────────────
  console.log(`\n9️⃣  Stripping remaining .only markers...`);
  console.log(`   ${await stripOnly()}`);

  // ─── Step 10: PR ──────────────────────────────────────────
  console.log(`\n🔟 Creating PR...`);
  await runPrAgent();

  process.exit(0);
}

main().catch((err) => {
  console.error(`\n❌ Bootstrap Orchestrator failed: ${err.message}`);
  process.exit(1);
});
