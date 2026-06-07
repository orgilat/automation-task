import { execSync } from 'child_process';

const branch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
const commit = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();

execSync(`git checkout ${branch}`);
execSync(`git reset --hard ${commit}`);
console.log('✅ Rolled back to previous state');
