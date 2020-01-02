import { convert, parse } from '../xliff-1_2';
import { ConvertOptions, ParseOptions } from '../../types';

mockDateNow();

const source = JSON.stringify({
    "@@locale": "en_US",
    "@@last_modified": "2019-12-31T16:00:00.000Z",
    "simple": "Super simple",
    "@simple": {
        "description": "",
        "type": "text",
        "placeholders": {},
    },
    "param": "Walk {distance}",
    "@param": {
        "description": "Walking instruction",
        "type": "text",
        "placeholders": {
            "distance": {
                "example": "500 m"
            },
        },
    },
    "long": "Very long string that exceeds the max char limit of 80 characters easily and thus forces a line break in the resulting PO file",
    "@long": {
        "description": "We need to test long comments as well, so this is me wasting time by writing something meaningful. Did you really read this to the end?",
        "type": "text",
        "placeholders": {},
    },
    "longlonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglongkey": "But a short string :D",
    "@longlonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglongkey": {
        "description": "Well, also the key might be very long and need to be broken to multiple lines",
        "type": "text",
        "placeholders": {},
    },
}, null, 2);

const target = JSON.stringify({
    "@@locale": "de_DE",
    "@@last_modified": "2019-12-31T16:00:00.000Z",
    "simple": "Super simpel",
    "@simple": {
        "description": "",
        "type": "text",
        "placeholders": {}
    },
    "param": "Laufe {distance}",
    "@param": {
        "description": "Walking instruction",
        "type": "text",
        "placeholders": {
            "distance": {
                "example": "500 m"
            },
        }
    },
    "long": "Ein sehr langer String der problemlos das maximale Zeichenlimit von 80 Zeichen überschreitet und damit einen Zeilenumbruch in der resultierenden PO-Datei erwingt",
    "@long": {
        "description": "We need to test long comments as well, so this is me wasting time by writing something meaningful. Did you really read this to the end?",
        "type": "text",
        "placeholders": {},
    },
    "longlonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglongkey": "Aber eine kurze Zeichenkette :D",
    "@longlonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglongkey": {
        "description": "Well, also the key might be very long and need to be broken to multiple lines",
        "type": "text",
        "placeholders": {},
    },
}, null, 2);

const expectedContentEmpty = ''
    + '<xliff xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="urn:oasis:names:tc:xliff:document:1.2 http://docs.oasis-open.org/xliff/v1.2/os/xliff-core-1.2-strict.xsd" xmlns="urn:oasis:names:tc:xliff:document:1.2" version="1.2">\n'
    + '  <file datatype="plaintext" xml:space="preserve" date="2019-12-31T16:00:00.000Z">\n'
    + '    <body/>\n'
    + '  </file>\n'
    + '</xliff>';

const expectedContentWithSource = ''
    + '<xliff xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="urn:oasis:names:tc:xliff:document:1.2 http://docs.oasis-open.org/xliff/v1.2/os/xliff-core-1.2-strict.xsd" xmlns="urn:oasis:names:tc:xliff:document:1.2" version="1.2">\n'
    + '  <file original="some ns" datatype="plaintext" xml:space="preserve" source-language="en-US" date="2019-12-31T16:00:00.000Z">\n'
    + '    <body>\n'
    + '      <trans-unit id="simple">\n'
    + '        <source>Super simple</source>\n'
    + '      </trans-unit>\n'
    + '      <trans-unit id="param">\n'
    + '        <source>Walk {distance}</source>\n'
    + '        <note from="developer">Walking instruction</note>\n'
    + '        <context-group purpose="informational">\n'
    + '          <context context-type="paramnotes">{distance} example: 500 m</context>\n'
    + '        </context-group>\n'
    + '      </trans-unit>\n'
    + '      <trans-unit id="long">\n'
    + '        <source>Very long string that exceeds the max char limit of 80 characters easily and thus forces a line break in the resulting PO file</source>\n'
    + '        <note from="developer">We need to test long comments as well, so this is me wasting time by writing something meaningful. Did you really read this to the end?</note>\n'
    + '      </trans-unit>\n'
    + '      <trans-unit id="longlonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglongkey">\n'
    + '        <source>But a short string :D</source>\n'
    + '        <note from="developer">Well, also the key might be very long and need to be broken to multiple lines</note>\n'
    + '      </trans-unit>\n'
    + '    </body>\n'
    + '  </file>\n'
    + '</xliff>';

const expectedContentWithSourceAndTarget = ''
    + '<xliff xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="urn:oasis:names:tc:xliff:document:1.2 http://docs.oasis-open.org/xliff/v1.2/os/xliff-core-1.2-strict.xsd" xmlns="urn:oasis:names:tc:xliff:document:1.2" version="1.2">\n'
    + '  <file original="some ns" datatype="plaintext" xml:space="preserve" source-language="en-US" target-language="de-DE" date="2019-12-31T16:00:00.000Z">\n'
    + '    <body>\n'
    + '      <trans-unit id="simple">\n'
    + '        <source>Super simple</source>\n'
    + '        <target>Super simpel</target>\n'
    + '      </trans-unit>\n'
    + '      <trans-unit id="param">\n'
    + '        <source>Walk {distance}</source>\n'
    + '        <target>Laufe {distance}</target>\n'
    + '        <note from="developer">Walking instruction</note>\n'
    + '        <context-group purpose="informational">\n'
    + '          <context context-type="paramnotes">{distance} example: 500 m</context>\n'
    + '        </context-group>\n'
    + '      </trans-unit>\n'
    + '      <trans-unit id="long">\n'
    + '        <source>Very long string that exceeds the max char limit of 80 characters easily and thus forces a line break in the resulting PO file</source>\n'
    + '        <target>Ein sehr langer String der problemlos das maximale Zeichenlimit von 80 Zeichen überschreitet und damit einen Zeilenumbruch in der resultierenden PO-Datei erwingt</target>\n'
    + '        <note from="developer">We need to test long comments as well, so this is me wasting time by writing something meaningful. Did you really read this to the end?</note>\n'
    + '      </trans-unit>\n'
    + '      <trans-unit id="longlonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglongkey">\n'
    + '        <source>But a short string :D</source>\n'
    + '        <target>Aber eine kurze Zeichenkette :D</target>\n'
    + '        <note from="developer">Well, also the key might be very long and need to be broken to multiple lines</note>\n'
    + '      </trans-unit>\n'
    + '    </body>\n'
    + '  </file>\n'
    + '</xliff>';

const xliffWithMissingAnnotations = ''
    + '<xliff xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="urn:oasis:names:tc:xliff:document:1.2 http://docs.oasis-open.org/xliff/v1.2/os/xliff-core-1.2-strict.xsd" xmlns="urn:oasis:names:tc:xliff:document:1.2" version="1.2">\n'
    + '  <file>\n'
    + '    <body>\n'
    + '      <trans-unit id="simple">\n'
    + '        <source>Super simple</source>\n'
    + '        <note>A simple string</note>\n'
    + '      </trans-unit>\n'
    + '      <trans-unit id="param">\n'
    + '        <source>Walk {distance}</source>\n'
    + '        <context-group purpose="informational">\n'
    + '          <context context-type="paramnotes">what\'s up</context>\n'
    + '        </context-group>\n'
    + '        <context-group>\n'
    + '          <context context-type="paramnotes">{distance} example: 500 m</context>\n'
    + '        </context-group>\n'
    + '      </trans-unit>\n'
    + '    </body>\n'
    + '  </file>\n'
    + '</xliff>';

const expectedArbFormXliffWithMissingAnnotations = JSON.stringify({
    "@@locale": "",
    "@@last_modified": "2019-12-31T16:00:00.000Z",
    "simple": "Super simple",
    "@simple": {
        "description": "",
        "type": "text",
        "placeholders": {},
    },
    "param": "Walk {distance}",
    "@param": {
        "description": "",
        "type": "text",
        "placeholders": {},
    },
}, null, 2);


describe('convert ARB to XLIFF 1.2', () => {
    test('with empty source and no other options', () => {
        expect(convert({ source: '{}' })).toEqual<ParseOptions>({
            content: expectedContentEmpty,
        });
    });

    test('with source strings only', () => {
        expect(convert({
            source,
            sourceLanguage: 'en-US',
            original: 'some ns'
        })).toEqual<ParseOptions>({
            content: expectedContentWithSource,
        });
    });

    test('with source and target strings', () => {
        expect(convert({
            source,
            target,
            sourceLanguage: 'en-US',
            targetLanguage: 'de-DE',
            original: 'some ns'
        })).toEqual<ParseOptions>({
            content: expectedContentWithSourceAndTarget,
        });
    });
});

describe('convert XLIFF 1.2 to ARB', () => {
    test('with source strings only', () => {
        const content = expectedContentWithSource;

        expect(parse({ content })).toEqual<ConvertOptions>({
            source,
            target: '',
            original: 'some ns',
            sourceLanguage: 'en-US',
            targetLanguage: '',
        });
    });

    test('with source and target strings', () => {
        const content = expectedContentWithSourceAndTarget;

        expect(parse({ content })).toEqual<ConvertOptions>({
            source,
            target,
            original: 'some ns',
            sourceLanguage: 'en-US',
            targetLanguage: 'de-DE',
        });
    });

    test('with some missing/malformed annotations', () => {
        const content = xliffWithMissingAnnotations;

        expect(parse({ content })).toEqual<ConvertOptions>({
            source: expectedArbFormXliffWithMissingAnnotations,
            target: '',
            original: '',
            sourceLanguage: '',
            targetLanguage: '',
        });
    });
});
