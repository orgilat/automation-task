import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { globSync } from 'glob';
import { runDebugAgent } from './specialists/debugAgent';
import { runTsCompilerAgent } from './specialists/tsCompilerAgent';
import { runValidationAgent } from './specialists/validationAgent';

interface FixInput {
  description: string;
  files: string[];
  runValidation?: boolean;

  pomsInvolved?: string[];
  tags?: string[];
  generateReport?: boolean;
  runDebug?: boolean;
}

function loadFixInput(): FixInput {
  const fixPath = path.resolve(process.cwd(), 'agents/fix-input.yaml');

  if (!fs.existsSync(fixPath)) {
    throw new Error(`agents/fix-input.yaml not found at: ${fixPath}`);
  }

  const input = yaml.load(fs.readFileSync(fixPath, 'utf-8')) as FixInput;

  if (!input || typeof input !== 'object') {
    throw new Error('agents/fix-input.yaml is empty or invalid');
  }

  if (typeof input.description !== 'string' || !input.description.trim()) {
    throw new Error('fix-input.yaml must include description: string');
  }

  if (!Array.isArray(input.files)) {
    throw new Error('fix-input.yaml must include files: string[]');
  }

  return input;
}

function expandFiles(files: string[]): string[] {
  const expandedFiles = files.flatMap((filePath) => {
    const normalizedPath = filePath.replace(/\\/g, '/');

    if (normalizedPath.includes('*')) {
      return globSync(normalizedPath, { nodir: true });
    }

    const absolutePath = path.resolve(process.cwd(), normalizedPath);

    if (fs.existsSync(absolutePath) && fs.statSync(absolutePath).isDirectory()) {
      return globSync(`${normalizedPath}/**/*.ts`, { nodir: true });
    }

    return [normalizedPath];
  });

  return [...new Set(expandedFiles)];
}

async function main(): Promise<void> {
  const divider = '━'.repeat(55);

  console.log(`\n${divider}`);
  console.log('🔧 Fix Orchestrator — TakeNote QA Suite');
  console.log(divider);

  const input = loadFixInput();
  input.files = expandFiles(input.files);

  console.log('\n📄 Loaded fix input:');
  console.log(`   Files: ${input.files.join(', ')}`);
  console.log(`   Validation: ${input.runValidation === true}`);

  console.log(`\n1️⃣  Running debug/fix agent...`);

  const fixed = await runDebugAgent({
    filePaths: input.files,
    errorLog: input.description,
    stdout: '',
  });

  console.log(`   Fix applied: ${fixed}`);

  console.log(`\n2️⃣  TypeScript check...`);

  const tsOk = await runTsCompilerAgent({
    filePaths: input.files,
  });

  if (!tsOk) {
    console.error('   ❌ TypeScript errors remain after fix');
    process.exit(1);
  }

  console.log(`   ✅ TypeScript OK`);

  if (input.runValidation) {
    console.log(`\n3️⃣  Validation run...`);

    const { passed, errorLog } = await runValidationAgent({
      filePaths: input.files,
    });

    if (!passed) {
      console.error(`   ❌ Tests still failing:\n${errorLog}`);
      process.exit(1);
    }

    console.log(`   ✅ Tests passing`);
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