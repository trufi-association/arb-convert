import { convert, parse, timezoneOffset, gettextToJs, Gettext } from '../gettext';
import { ConvertOptions, ParseOptions } from '../../types';

const { now } = mockDateNow();

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
    + '# Translation converted from ARB\n'
    + '# original: \n'
    + '# srcLang: \n'
    + '# trgLang: \n'
    + 'msgid ""\n'
    + 'msgstr ""\n'
    + '"PO-Revision-Date: 2019-12-31 16:00+0000"\n'
    + '"MIME-Version: 1.0"\n'
    + '"Content-Type: text/plain; charset=UTF-8"\n'
    + '"Content-Transfer-Encoding: 8bit"\n';

const expectedContentWithSource = ''
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
    + 'msgstr ""\n'
    + '\n'
    + '#. Walking instruction\n'
    + '#. {distance} example: 500 m\n'
    + 'msgctxt "param"\n'
    + 'msgid "Walk {distance}"\n'
    + 'msgstr ""\n'
    + '\n'
    + '#. We need to test long comments as well, so this is me wasting time by writing \n'
    + '#. something meaningful. Did you really read this to the end?\n'
    + 'msgctxt "long"\n'
    + 'msgid ""\n'
    + '"Very long string that exceeds the max char limit of 80 characters easily and t"\n'
    + '"hus forces a line break in the resulting PO file"\n'
    + 'msgstr ""\n'
    + '\n'
    + '#. Well, also the key might be very long and need to be broken to multiple lines\n'
    + 'msgctxt ""\n'
    + '"longlonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglo"\n'
    + '"ngkey"\n'
    + 'msgid "But a short string :D"\n'
    + 'msgstr ""\n';

const expectedContentWithSourceAndTarget = ''
    + '# Translation converted from ARB\n'
    + '# original: some ns\n'
    + '# srcLang: en-US\n'
    + '# trgLang: de-DE\n'
    + 'msgid ""\n'
    + 'msgstr ""\n'
    + '"PO-Revision-Date: 2019-12-31 16:00+0000"\n'
    + '"MIME-Version: 1.0"\n'
    + '"Content-Type: text/plain; charset=UTF-8"\n'
    + '"Content-Transfer-Encoding: 8bit"\n'
    + '\n'
    + 'msgctxt "simple"\n'
    + 'msgid "Super simple"\n'
    + 'msgstr "Super simpel"\n'
    + '\n'
    + '#. Walking instruction\n'
    + '#. {distance} example: 500 m\n'
    + 'msgctxt "param"\n'
    + 'msgid "Walk {distance}"\n'
    + 'msgstr "Laufe {distance}"\n'
    + '\n'
    + '#. We need to test long comments as well, so this is me wasting time by writing \n'
    + '#. something meaningful. Did you really read this to the end?\n'
    + 'msgctxt "long"\n'
    + 'msgid ""\n'
    + '"Very long string that exceeds the max char limit of 80 characters easily and t"\n'
    + '"hus forces a line break in the resulting PO file"\n'
    + 'msgstr ""\n'
    + '"Ein sehr langer String der problemlos das maximale Zeichenlimit von 80 Zeichen"\n'
    + '" überschreitet und damit einen Zeilenumbruch in der resultierenden PO-Datei er"\n'
    + '"wingt"\n'
    + '\n'
    + '#. Well, also the key might be very long and need to be broken to multiple lines\n'
    + 'msgctxt ""\n'
    + '"longlonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglo"\n'
    + '"ngkey"\n'
    + 'msgid "But a short string :D"\n'
    + 'msgstr "Aber eine kurze Zeichenkette :D"\n';

describe('convert ARB to gettext PO', () => {
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

describe('convert gettext PO to ARB', () => {
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
});

describe('gettext utility functions', () => {
    test('timezoneOffset output with different timezones', () => {
        const date = new Date(now);
        // date.getTimezoneOffset() always returns the loca TZ offset, so we have to
        // monkey patch it to return different results.
        date.getTimezoneOffset = () => 0;
        expect(timezoneOffset(date)).toBe('+0000');

        date.getTimezoneOffset = () => -60;
        expect(timezoneOffset(date)).toBe('+0100');

        date.getTimezoneOffset = () => -270;
        expect(timezoneOffset(date)).toBe('+0430');

        date.getTimezoneOffset = () => 300;
        expect(timezoneOffset(date)).toBe('-0500');
    });

    test('gettextToJs with all possible comment types', () => {
        const content = ''
            + '# first line\n'
            + '# second line\n'
            + '#. 1st line\n'
            + '#. 2nd line\n'
            + '#: file.dart:123, another_file.dart:456\n'
            + '#, fuzzy, c-format\n'
            + 'msgctxt "context"\n'
            + 'msgid "source string"\n'
            + 'msgstr ""\n'
            + '"target "\n'
            + '"string"\n';

        expect(gettextToJs(content)).toEqual<Gettext>([
            {
                translatorCommentLines: [
                    'first line',
                    'second line',
                ],
                extractedCommentLines: [
                    '1st line',
                    '2nd line',
                ],
                references: [
                    'file.dart:123',
                    'another_file.dart:456',
                ],
                flags: ['fuzzy', 'c-format'],
                msgctxt: 'context',
                msgid: 'source string',
                msgstr: 'target string',
            }
        ]);
    });
});
