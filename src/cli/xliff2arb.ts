#!/usr/bin/env node

import commander from 'commander';
import fs from 'fs';
import { parseToArb } from '../index';

const program = new commander.Command();
program
  .name('xliff2arb')
  .option('--file <filename>', 'source XLIFF file (required)')
  .option('--sourceout <filename>', 'write source ARB to file if given or stdout if omitted')
  .option('--targetout <filename>', 'write target ARB to file if given')
  .parse(process.argv);

// No params
if (program.rawArgs.length <= 2) {
  program.help(); // shows help and exits
}

try {
  if (!program.file) {
    throw new Error("option '--file <filename>' is required");
  }

  const fileContent = fs.readFileSync(program.file, 'utf8');
  const result = parseToArb('xliff', {
    content: fileContent,
  });

  if (program.sourceout) {
    fs.writeFileSync(program.sourceout, result.source);
  } else {
    process.stdout.write(result.source);
  }

  if (program.targetout) {
    fs.writeFileSync(program.targetout, result.target);
  }
} catch (error) {
  process.stdout.write(`error: ${error.message}`);
  process.exit(1);
}
