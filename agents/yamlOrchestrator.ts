import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { runYamlWriterAgent } from './specialists/yamlWriterAgent';

async function main(): Promise<void> {
  const divider = '━'.repeat(55);
  console.log(`\n${divider}`);
  console.log('📝 YAML Orchestrator — TakeNote QA Suite');
  console.log(divider);

  // Get request from CLI arg or yaml-request.txt
  let request = process.argv.slice(2).join(' ').trim();

  if (!request) {
    const txtPath = path.resolve(process.cwd(), 'agents/yaml-request.txt');
    if (fs.existsSync(txtPath)) {
      request = fs.readFileSync(txtPath, 'utf-8').trim();
    }
  }

  if (!request) {
    console.error('❌ No request provided. Pass as CLI arg or write to agents/yaml-request.txt');
    process.exit(1);
  }

  console.log(`\n📥 Request: "${request}"\n`);

  await runYamlWriterAgent({ request });

  const outputPath = path.resolve(process.cwd(), 'agents/input.yaml');
  console.log(`\n${divider}`);
  console.log(`✅ agents/input.yaml generated`);
  console.log(`\nNext steps:`);
  console.log(`  1. Review: cat agents/input.yaml`);
  console.log(`  2. Run:    npm run agents:bootstrap`);
  console.log(divider);

  process.exit(0);
}

main().catch((err) => {
  console.error(`\n❌ YAML Orchestrator failed: ${err.message}`);
  process.exit(1);
});
