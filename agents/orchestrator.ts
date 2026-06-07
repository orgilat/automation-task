import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import * as readline from 'readline';
import yaml from 'js-yaml';
import { runOnlyCleanupAgent } from './specialists/onlyCleanupAgent';
import { runPomWriterAgent } from './specialists/pomWriterAgent';
import { runFixtureWriterAgent } from './specialists/fixtureWriterAgent';
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

export async function runPipeline(): Promise<void> {
  const divider = '━'.repeat(55);

  console.log(`\n${divider}`);
  console.log('🚀 Orchestrator — TakeNote QA Suite');
  console.log(divider);

  const input = loadInput();
  const tags = input.tags || ['@e2e'];
  const pomsInvolved = input.pomsInvolved || [];
  const createdFiles: string[] = [];

  console.log(`\n0️⃣  Cleaning stale .only markers...`);
  console.log(`   ${await runOnlyCleanupAgent()}`);

  if (pomsInvolved.length > 0) {
    console.log(`\n1️⃣  Checking/creating ${pomsInvolved.length} POM(s)...`);
    for (const pageName of pomsInvolved) {
      const pomPath = path.resolve(process.cwd(), `pages/${pageName}.ts`);
      if (fs.existsSync(pomPath)) {
        console.log(`   ⏭  ${pageName} already exists — skipping`);
      } else {
        await runPomWriterAgent({ pageName, description: `POM for ${pageName}`, elements: [] });
        await runFixtureWriterAgent({
          pageName,
          fixtureName: pageName.charAt(0).toLowerCase() + pageName.slice(1),
        });
        createdFiles.push(`pages/${pageName}.ts`);
      }
    }
  } else {
    console.log(`\n1️⃣  No new POMs specified`);
  }

  console.log(`\n2️⃣  Building test...`);
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

  console.log(`\n3️⃣  Clean code check...`);
  const cleanResult = await runCleanCodeAgent({ filePaths: createdFiles });

  console.log(`\n4️⃣  TypeScript check...`);
  if (!(await runTsCompilerAgent({ filePaths: createdFiles }))) {
    console.error('❌ TypeScript errors — aborting');
    process.exit(1);
  }

  console.log(`\n5️⃣  Running tests...`);
  const { passed, errorLog, stdout } = await runValidationAgent({ filePaths: testFiles });

  let finalPassed = passed;
  if (!passed && input.runDebug !== false) {
    console.log(`\n6️⃣  Debug agent — attempting fix...`);
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
