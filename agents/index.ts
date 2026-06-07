import 'dotenv/config';
import { runPipeline } from './orchestrator';

console.log('index.ts loaded');
runPipeline().catch(console.error);
