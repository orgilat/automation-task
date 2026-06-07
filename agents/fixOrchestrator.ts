import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { runDebugAgent } from './specialists/debugAgent';
import { runTsCompilerAgent } from './specialists/tsCompilerAgent';
import { runValidationAgent } from './specialists/validationAgent';

interface FixInput {
  description: string;
  files: string[];
  runValidation?: boolean;
}

function loadFixInput(): FixInput {
  const fixPath = path.resolve(process.cwd(), 'agents/fix-input.yaml');
  if (!fs.existsSync(fixPath)) throw new Error('agents/fix-input.yaml not found');
  return yaml.load(fs.readFileSync(fixPath, 'utf-8')) as FixInput;
}

async function main(): Promise<void> {
  const divider = '━'.repeat(55);
  console.log(`\n${divider}`);
  console.log('🔧 Fix Orchestrator — TakeNote QA Suite');
  console.log(divider);

  const input = loadFixInput();

  console.log(`\n1️⃣  Running debug/fix agent...`);
  const fixed = await runDebugAgent({
    filePaths: input.files,
    errorLog: input.description,
    stdout: '',
  });
  console.log(`   Fix applied: ${fixed}`);

  console.log(`\n2️⃣  TypeScript check...`);
  const tsOk = await runTsCompilerAgent({ filePaths: input.files });
  if (!tsOk) {
    console.error('   ❌ TypeScript errors remain after fix');
    process.exit(1);
  }
  console.log(`   ✅ TypeScript OK`);

  if (input.runValidation) {
    console.log(`\n3️⃣  Validation run...`);
    const { passed, errorLog } = await runValidationAgent({ filePaths: input.files });
    if (passed) {
      console.log(`   ✅ Tests passing`);
    } else {
      console.error(`   ❌ Tests still failing:\n${errorLog}`);
      process.exit(1);
    }
  }

  console.log(`\n${divider}`);
  console.log('✅ Fix Orchestrator — complete');
  console.log(divider);
  process.exit(0);
}

main().catch((err) => {
  console.error(`\n❌ Fix Orchestrator failed: ${err.message}`);
  process.exit(1);
});
