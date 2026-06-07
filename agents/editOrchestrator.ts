import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import * as readline from 'readline';
import yaml from 'js-yaml';
import { runOnlyCleanupAgent } from './specialists/onlyCleanupAgent';
import { runTestBuilderAgent } from './specialists/testBuilderAgent';
import { runCleanCodeAgent } from './specialists/cleanCodeAgent';
import { runTsCompilerAgent } from './specialists/tsCompilerAgent';
import { runValidationAgent } from './specialists/validationAgent';
import { runDebugAgent } from './specialists/debugAgent';
import { runSummaryAgent } from './specialists/summaryAgent';
import { runPrAgent } from './specialists/prAgent';

interface InputYaml {
  description: string;
  pomsInvolved?: string[];
  tags?: string[];
  runDebug?: boolean;
}

function loadInput(): InputYaml {
  const inputPath = path.resolve(process.cwd(), 'agents/input.yaml');
  if (!fs.existsSync(inputPath)) throw new Error('agents/input.yaml not found');
  return yaml.load(fs.readFileSync(inputPath, 'utf-8')) as InputYaml;
}

function waitForApproval(): Promise<void> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(
      '\n⏸  Review edits above, then press ENTER to commit (or Ctrl+C to abort)...\n',
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
  console.log('✏️  Edit Orchestrator — TakeNote QA Suite');
  console.log(divider);

  const input = loadInput();
  const tags = input.tags || ['@e2e'];
  const pomsInvolved = input.pomsInvolved || [];

  console.log(`\n0️⃣  Cleaning stale .only markers...`);
  console.log(`   ${await runOnlyCleanupAgent()}`);

  console.log(`\n1️⃣  Building/editing test (no new POMs)...`);
  const testResult = await runTestBuilderAgent({
    description: input.description,
    pomsInvolved,
    tags,
  });
  const testFiles = testResult
    .split('\n')
    .filter((l) => l.trim().endsWith('.spec.ts'))
    .map((l) => l.trim());

  console.log(`\n2️⃣  Clean code check...`);
  const cleanResult = await runCleanCodeAgent({ filePaths: testFiles });

  console.log(`\n3️⃣  TypeScript check...`);
  if (!(await runTsCompilerAgent({ filePaths: testFiles }))) {
    console.error('❌ TypeScript errors — aborting');
    process.exit(1);
  }

  console.log(`\n4️⃣  Running tests...`);
  const { passed, errorLog, stdout } = await runValidationAgent({ filePaths: testFiles });

  let finalPassed = passed;
  if (!passed && input.runDebug !== false) {
    console.log(`\n5️⃣  Debug agent — attempting fix...`);
    finalPassed = await runDebugAgent({ filePaths: testFiles, errorLog, stdout });
  }

  runSummaryAgent({
    testFiles,
    cleanCode: cleanResult,
    validationPassed: finalPassed,
    errorLog,
    stdout,
  });

  await waitForApproval();

  console.log(`\n   Stripping .only...`);
  console.log(`   ${await runOnlyCleanupAgent()}`);

  await runPrAgent();
  process.exit(0);
}

main().catch((err) => {
  console.error(`\n❌ Edit Orchestrator failed: ${err.message}`);
  process.exit(1);
});
