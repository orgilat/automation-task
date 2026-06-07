import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const REQUIRED_GITIGNORE_ENTRIES = [
  'agents/failure-reports/',
  'downloads/',
  'node_modules/',
  'playwright-report/',
  'allure-results/',
  'allure-report/',
  'test-results/',
  '.env',
];

function ensureGitignore(): void {
  const gitignorePath = path.resolve(process.cwd(), '.gitignore');
  const current = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf-8') : '';

  const missing = REQUIRED_GITIGNORE_ENTRIES.filter((entry) => !current.includes(entry));
  if (missing.length > 0) {
    const updated = `${current}\n# Added by prAgent\n${missing.join('\n')}\n`;
    fs.writeFileSync(gitignorePath, updated, 'utf-8');
    console.log(`🔧 prAgent — added ${missing.length} missing .gitignore entries`);
  }
}

function run(cmd: string): string {
  return execSync(cmd, { cwd: process.cwd(), encoding: 'utf-8', timeout: 30_000 }).trim();
}

function hasGitDeltas(): boolean {
  const status = run('git status --porcelain');
  return status.trim().length > 0;
}

export async function runPrAgent(): Promise<void> {
  const handoffPath = path.resolve(process.cwd(), 'agents/context/modified-files.txt');
  const modifiedFiles = fs.existsSync(handoffPath)
    ? fs.readFileSync(handoffPath, 'utf-8').split('\n').filter(Boolean)
    : [];

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🚀 prAgent — starting PR creation`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  // Step 1: Ensure .gitignore is correct
  console.log(`\n1️⃣  Validating .gitignore...`);
  ensureGitignore();
  console.log(`   ✅ .gitignore OK`);

  // Step 2: Check for changes
  console.log(`\n2️⃣  Checking for git deltas...`);
  if (!hasGitDeltas()) {
    console.log(`   ⚠️  No changes detected — skipping PR creation`);
    return;
  }
  console.log(`   ✅ Changes found`);

  // Step 3: Create branch
  const timestamp = Date.now();
  const branch = `feat/auto-${timestamp}`;
  console.log(`\n3️⃣  Creating branch: ${branch}`);
  run(`git checkout -b ${branch}`);
  console.log(`   ✅ Branch created`);

  // Step 4: Stage files
  console.log(`\n4️⃣  Staging files...`);
  if (modifiedFiles.length > 0) {
    for (const file of modifiedFiles) {
      try {
        run(`git add "${file}"`);
        console.log(`   ✅ Staged: ${file}`);
      } catch {
        console.log(`   ⚠️  Could not stage: ${file}`);
      }
    }
  } else {
    run('git add -A');
    console.log(`   ✅ Staged all changes`);
  }

  // Step 5: Commit
  const firstFile = modifiedFiles[0] || 'changes';
  const n = modifiedFiles.length;
  const commitMsg =
    n > 1 ? `feat: update ${n} file(s) — ${firstFile} +${n - 1} more` : `feat: update ${firstFile}`;

  console.log(`\n5️⃣  Creating commit...`);
  run(`git commit -m "${commitMsg}"`);
  console.log(`   ✅ Committed: ${commitMsg}`);

  // Step 6: Push
  console.log(`\n6️⃣  Pushing to origin...`);
  try {
    run(`git push --set-upstream origin ${branch}`);
    console.log(`   ✅ Pushed to origin/${branch}`);
  } catch (e: any) {
    console.log(`   ⚠️  Push failed (no remote configured?): ${e.message}`);
  }

  // Step 7: Clear handoff file
  fs.writeFileSync(handoffPath, '', 'utf-8');
  console.log(`\n7️⃣  Cleared modified-files.txt`);

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ prAgent — branch ${branch} ready`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
}
