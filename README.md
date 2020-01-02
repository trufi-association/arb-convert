# arb-convert

![Build Status](https://github.com/trufi-association/arb-convert/workflows/build/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/trufi-association/arb-convert/badge.svg?branch=master)](https://coveralls.io/github/trufi-association/arb-convert?branch=master)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/trufi-association/arb-convert/issues)

Tool to convert JSON-based [Application Resource Bundle](https://github.com/google/app-resource-bundle) (ARB) localization format by Google to another format and back.

```shell
npm install -g arb-convert
```

## Background

ARB is the format of choice when using the [Dart intl](https://pub.dev/packages/intl) package to localize [Flutter](https://flutter.dev/) apps. It has not seen wide adoption by translation providers however. Since December 2019, Google shut down its Translator Toolkit that has natively supported the ARB format. So now Flutter devs can either migrate to another library and format, edit files by hand or convert to another format. This project aims to aid with the latter.

## Supported formats

* XLIFF 1.2/2.0/2.1
* GNU gettext
* ... add your format, PRs welcome

Please note that ICU placeholders and plural notations are not converted.

## Node.js

```js
const arbConvert = require('arb-convert');
const { convertFromArb, parseToArb } = arbConvert;

const xmlString = convertFromArb('xliff-1.2', {
    source: '{ "@@locale": "en-US", ... }',
    target: '{ "@@locale": "de-DE", ... }', // optional
    original: 'namespace', // optional
    sourceLanguage: 'en-US', // optional (override)
    targetLanguage: 'de-DE', // optional (override)
});

const result = parseToArb('xliff', {
    content: xmlString,
});
// { source, target, original, sourceLanguage, targetLanguage }

```

## Binaries

### arb2xliff

```shell
Usage: arb2xliff [options]

Options:
  --sourcefile <filename>  source ARB file (required)
  --targetfile <filename>  target ARB file
  --original <value>       where the translations come from
  --sourcelang <locale>    source locale override, e.g. en-US, in case it cannot be determined from file content or file name
  --targetlang <locale>    target locale override, e.g. de-DE, in case it cannot be determined from file content or file name
  --outversion <version>   XLIFF version, e.g. 1.2 (default) or 2.0/2.1
  --out <filename>         write XLIFF to file if given or stdout if omitted
  -h, --help               output usage information
```

### xliff2arb

```shell
Usage: xliff2arb [options]

Options:
  --file <filename>       source XLIFF file (required)
  --sourceout <filename>  write source ARB to file if given or stdout if omitted
  --targetout <filename>  write target ARB to file if given
  -h, --help              output usage information
```

### arb2po

```shell
Usage: arb2po [options]

Options:
  --sourcefile <filename>  source ARB file (required)
  --targetfile <filename>  target ARB file
  --original <value>       where the translations come from
  --sourcelang <locale>    source locale override, e.g. en-US, in case it cannot be determined from file content or file name
  --targetlang <locale>    target locale override, e.g. de-DE, in case it cannot be determined from file content or file name
  --out <filename>         write PO to file if given or stdout if omitted
  -h, --help               output usage information
```

### po2arb

```shell
Usage: po2arb [options]

Options:
  --file <filename>       source PO file (required)
  --sourceout <filename>  write source ARB to file if given or stdout if omitted
  --targetout <filename>  write target ARB to file if given
  -h, --help              output usage information
```
