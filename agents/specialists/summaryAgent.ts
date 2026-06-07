interface SummaryInput {
  locators?: string[];
  testFiles?: string[];
  cleanCode?: string;
  validationPassed?: boolean;
  errorLog?: string;
  stdout?: string;
}

export function runSummaryAgent(input: SummaryInput): void {
  const divider = '━'.repeat(55);
  const thinDivider = '─'.repeat(55);

  console.log(`\n${divider}`);
  console.log('📋 PIPELINE SUMMARY');
  console.log(divider);

  if (input.testFiles && input.testFiles.length > 0) {
    console.log('\n📁 TEST FILES');
    console.log(thinDivider);
    input.testFiles.forEach((f) => console.log(`  ✅ ${f}`));
  }

  if (input.cleanCode) {
    console.log('\n🧹 CLEAN CODE');
    console.log(thinDivider);
    console.log(input.cleanCode);
  }

  console.log('\n🔍 VALIDATION');
  console.log(thinDivider);
  if (input.validationPassed) {
    console.log('  ✅ All tests passed');
  } else {
    console.log('  ❌ Tests failed');

    if (input.errorLog) {
      console.log('\n❌ FAILURE DETAILS');
      console.log(thinDivider);

      // Try to extract structured failure data
      const failureBlocks = input.errorLog
        .split('\n')
        .filter((line) => line.includes('Error:') || line.includes('FAILED') || line.includes('×'))
        .slice(0, 10);

      if (failureBlocks.length > 0) {
        const structured = {
          failures: failureBlocks,
          raw_log_lines: input.errorLog.split('\n').length,
        };
        console.log(JSON.stringify(structured, null, 2));
      } else {
        console.log(input.errorLog.slice(0, 2000));
      }
    }
  }

  console.log(`\n${divider}\n`);
}
