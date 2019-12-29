#!/usr/bin/env node

import fs from 'fs';
import commander from 'commander';
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
  program.help();
  process.exit(1);
}

try {
    if (!program.file) {
        throw new Error('file option is required')
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
  console.log(`error: ${error.message}`);
  console.log(error);
  process.exit(1);
}