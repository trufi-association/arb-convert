#!/usr/bin/env node

import commander from 'commander';
import fs from 'fs';
import { convertFromArb } from '../index';
import parseLocale from '../util/parseLocale';

const program = new commander.Command();
program
  .name('arb2po')
  .option('--sourcefile <filename>', 'source ARB file (required)')
  .option('--targetfile <filename>', 'target ARB file')
  .option('--original <value>', 'where the translations come from')
  .option('--sourcelang <locale>', 'source locale override, e.g. en-US, in case it cannot be determined from file content or file name')
  .option('--targetlang <locale>', 'target locale override, e.g. de-DE, in case it cannot be determined from file content or file name')
  .option('--out <filename>', 'write PO to file if given or stdout if omitted')
  .parse(process.argv);

// No params
if (program.rawArgs.length <= 2) {
  program.help(); // shows help and exits
}

try {
  if (!program.sourcefile) {
    throw new Error("option '--sourcefile <filename>' is required");
  }

  const sourceContent = fs.readFileSync(program.sourcefile, 'utf8');
  const targetContent = program.targetfile && fs.readFileSync(program.targetfile, 'utf8');
  const result = convertFromArb('gettext', {
    source: sourceContent,
    target: targetContent,
    original: program.original,
    sourceLanguage: parseLocale(
      program.sourcelang,
      determineArbLocale(sourceContent),
      program.sourcefile,
    ),
    targetLanguage: program.targetfile && parseLocale(
      program.targetlang,
      determineArbLocale(targetContent),
      program.targetfile,
    ),
  });

  if (program.out) {
    fs.writeFileSync(program.out, result.content);
  } else {
    process.stdout.write(result.content);
  }
} catch (error) {
  process.stdout.write(`error: ${error.message}`);
  process.exit(1);
}

function determineArbLocale(content: string) {
  const matches = content.match(/"@@locale":\s*"(.+)"/);

  if (matches) {
    return matches[1];
  }

  return '';
}
