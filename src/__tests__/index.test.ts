import { convertFromArb, parseToArb } from '../index';
import { ConvertOptions, ParseOptions } from '../types';

const { now } = mockDateNow();

const arb = JSON.stringify({
    "@@locale": "en_US",
    "@@last_modified": new Date(now).toISOString(),
    "simple": "Super simple",
    "@simple": {
        "description": "",
        "type": "text",
        "placeholders": {},
    },
}, null, 2);

const xliff1_2 = ''
    + '<xliff xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="urn:oasis:names:tc:xliff:document:1.2 http://docs.oasis-open.org/xliff/v1.2/os/xliff-core-1.2-strict.xsd" xmlns="urn:oasis:names:tc:xliff:document:1.2" version="1.2">\n'
    + '  <file original="some ns" datatype="plaintext" xml:space="preserve" source-language="en-US" date="2019-12-31T16:00:00.000Z">\n'
    + '    <body>\n'
    + '      <trans-unit id="simple">\n'
    + '        <source>Super simple</source>\n'
    + '      </trans-unit>\n'
    + '    </body>\n'
    + '  </file>\n'
    + '</xliff>';

const xliff2_1 = ''
    + '<xliff xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="urn:oasis:names:tc:xliff:document:2.0 http://docs.oasis-open.org/xliff/xliff-core/v2.1/cos02/schemas/xliff_core_2.0.xsd" xmlns="urn:oasis:names:tc:xliff:document:2.0" version="2.0" srcLang="en-US">\n'
    + '  <file id="arb" original="some ns" xml:space="preserve">\n'
    + '    <unit id="simple">\n'
    + '      <segment>\n'
    + '        <source>Super simple</source>\n'
    + '      </segment>\n'
    + '    </unit>\n'
    + '  </file>\n'
    + '</xliff>';

const gettext = ''
    + '# Translation converted from ARB\n'
    + '# original: some ns\n'
    + '# srcLang: en-US\n'
    + '# trgLang: \n'
    + 'msgid ""\n'
    + 'msgstr ""\n'
    + '"PO-Revision-Date: 2019-12-31 16:00+0000"\n'
    + '"MIME-Version: 1.0"\n'
    + '"Content-Type: text/plain; charset=UTF-8"\n'
    + '"Content-Transfer-Encoding: 8bit"\n'
    + '\n'
    + 'msgctxt "simple"\n'
    + 'msgid "Super simple"\n'
    + 'msgstr ""\n';

describe('converting from ARB', () => {
    const options: ConvertOptions = {
        original: 'some ns',
        source: arb,
        sourceLanguage: 'en-US',
    };

    test('converting to XLIFF 1.2', () => {
        const result: ParseOptions = {
            content: xliff1_2,
        };

        expect(convertFromArb('xliff', options)).toEqual(result);
        expect(convertFromArb('xliff-1.x', options)).toEqual(result);
        expect(convertFromArb('xliff-1.2', options)).toEqual(result);
    });

    test('converting to XLIFF 2.1', () => {
        const result: ParseOptions = {
            content: xliff2_1,
        };

        expect(convertFromArb('xliff-2.x', options)).toEqual(result);
        expect(convertFromArb('xliff-2.0', options)).toEqual(result);
        expect(convertFromArb('xliff-2.1', options)).toEqual(result);
    });

    test('converting to gettext PO', () => {
        const result: ParseOptions = {
            content: gettext,
        };

        expect(convertFromArb('gettext', options)).toEqual(result);
    });

    test('converting to invalid format', () => {
        expect(() => convertFromArb('invalid', options)).toThrow('Format invalid is not supported');
    });
});

describe('parsing to ARB', () => {
    const result: ConvertOptions = {
        original: 'some ns',
        source: arb,
        target: '',
        sourceLanguage: 'en-US',
        targetLanguage: '',
    };

    test('parsing XLIFF 1.2', () => {
        const options: ParseOptions = {
            content: xliff1_2,
        };

        expect(parseToArb('xliff', options)).toEqual(result);
        expect(parseToArb('xliff-1.x', options)).toEqual(result);
        expect(parseToArb('xliff-1.2', options)).toEqual(result);
    });

    test('parsing XLIFF 2.1', () => {
        const options: ParseOptions = {
            content: xliff2_1,
        };

        expect(parseToArb('xliff', options)).toEqual(result);
        expect(parseToArb('xliff-2.x', options)).toEqual(result);
        expect(parseToArb('xliff-2.0', options)).toEqual(result);
        expect(parseToArb('xliff-2.1', options)).toEqual(result);
    });

    test('parsing unsupported XLIFF version', () => {
        const options: ParseOptions = {
            content: '<xliff xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="urn:oasis:names:tc:xliff:document:1.1 http://www.oasis-open.org/committees/xliff/documents/xliff-core-1.1.xsd" xmlns="urn:oasis:names:tc:xliff:document:1.1" version="1.1"></xliff>',
        };

        expect(() => parseToArb('xliff', options)).toThrow('Format xliff-1.1 is not supported');
        expect(() => parseToArb('xliff-1.0', options)).toThrow('Format xliff-1.0 is not supported');
        expect(() => parseToArb('xliff-1.1', options)).toThrow('Format xliff-1.1 is not supported');

        // Malformed
        expect(() => parseToArb('xliff', { content: '<xliff />' })).toThrow('Could not determine XLIFF version');
    });

    test('parsing gettext PO', () => {
        const options: ParseOptions = {
            content: gettext,
        };

        expect(parseToArb('gettext', options)).toEqual(result);
    });

    test('parsing invalid format', () => {
        const options: ParseOptions = {
            content: '',
        };

        expect(() => parseToArb('invalid', options)).toThrow('Format invalid is not supported');
    });
});
