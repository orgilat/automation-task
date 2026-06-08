import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const run = (cmd: string) => execSync(cmd, { stdio: 'inherit', cwd: process.cwd() });

// Clear old results but preserve history for trends
const resultsDir = path.join(process.cwd(), 'allure-results');
const historyDir = path.join(resultsDir, 'history');
const savedHistory = path.join(process.cwd(), '.allure-history');

// Save history before clearing
if (fs.existsSync(historyDir)) {
  fs.cpSync(historyDir, savedHistory, { recursive: true });
}

// Clear results
if (fs.existsSync(resultsDir)) {
  fs.rmSync(resultsDir, { recursive: true });
}
fs.mkdirSync(resultsDir);

// Restore history so trends work
if (fs.existsSync(savedHistory)) {
  fs.cpSync(savedHistory, historyDir, { recursive: true });
}

console.log('🧪 Running tests...');
let testsFailed = false;
try {
  run('npx playwright test --project=chromium');
} catch {
  testsFailed = true;
}

console.log('\n📊 Generating Allure report...');
run('npx allure generate allure-results --clean -o allure-report');

// Save new history
const newHistory = path.join(process.cwd(), 'allure-report', 'history');
if (fs.existsSync(newHistory)) {
  fs.cpSync(newHistory, savedHistory, { recursive: true });
}

if (testsFailed) {
  console.log('\n❌ Tests failed — report generated. Open manually: npm run report:open');
  process.exit(1);
}

console.log('\n🌐 Opening report...');
run('npx allure open allure-report');
