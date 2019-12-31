import { ConvertOptions, ParseOptions, ApplicationResourceBundle, ArbPlaceholders } from '../types';
import zeroPad from '../util/zeroPad';

const MAX_CHAR_WIDTH = 80;

export function convert({
    source,
    target,
    original,
    sourceLanguage,
    targetLanguage
}: ConvertOptions): ParseOptions {
    const sourceJs = JSON.parse(source);
    const targetJs = target ? JSON.parse(target) : '';
    let content = '';

    // Header
    content += `
# Translation converted from ARB
# original: ${original || ''}
# srcLang: ${sourceLanguage || ''}
# trgLang: ${targetLanguage || ''}
msgid ""
msgstr ""
"PO-Revision-Date: ${formatDate(new Date(Date.now()))}"
"MIME-Version: 1.0"
"Content-Type: text/plain; charset=UTF-8"
"Content-Transfer-Encoding: 8bit"
    `.trim();

    // white-space
    // #  translator-comments
    // #. extracted-comments
    // #: reference…
    // #, flag…
    // #| msgid previous-untranslated-string
    // msgctxt context
    // msgid untranslated-string
    // msgstr translated-string
    Object.keys(sourceJs)
        .filter(key => key[0] !== '@')
        .forEach(key => {
            const sourceString = sourceJs[key];
            const targetString = targetJs && targetJs[key];
            const { description, placeholders } = sourceJs['@' + key];

            content += '\n';

            if (description) {
                content += '\n' + gettextComment('#.', description, MAX_CHAR_WIDTH);
            }

            Object.keys(placeholders).forEach(paramName =>
                Object.keys(placeholders[paramName]).forEach(property => {
                    const example = `{${paramName}} ${property}: ${placeholders[paramName][property]}`;
                    content += '\n' + gettextComment('#.', example, MAX_CHAR_WIDTH);
                })
            );

            content += '\n' + gettextString('msgctxt', key, MAX_CHAR_WIDTH);
            content += '\n' + gettextString('msgid', sourceString, MAX_CHAR_WIDTH);
            content += '\n' + gettextString('msgstr', targetString, MAX_CHAR_WIDTH);
        });

    content += '\n';

    return { content };
}

export function parse({ content }: ParseOptions): ConvertOptions {
    const gettext = gettextToJs(content);
    const srcArb: ApplicationResourceBundle = {};
    const trgArb: ApplicationResourceBundle = {};

    let original = '';
    let sourceLanguage = 'en-US';
    let targetLanguage = undefined;

    srcArb['@@locale'] = '';
    srcArb['@@last_modified'] = '';
    trgArb['@@locale'] = '';
    trgArb['@@last_modified'] = '';

    for (const entry of gettext) {
        // Header
        if (entry.msgctxt === '' && entry.msgid === '') {
            for (const comment of entry.translatorCommentLines) {
                if (comment.startsWith('original: ')) {
                    original = comment.substr(10);
                }
                else if (comment.startsWith('srcLang: ')) {
                    sourceLanguage = comment.substr(9);
                }
                else if (comment.startsWith('trgLang: ')) {
                    targetLanguage = comment.substr(9);
                }
            }
        }
        else {
            const key = entry.msgctxt.replace('\\n', '\n');
            const srcString = entry.msgid.replace('\\n', '\n');
            const trgString = entry.msgstr.replace('\\n', '\n');
            const placeholders: ArbPlaceholders = {};
            let description = '';

            for (const comment of entry.extractedCommentLines) {
                const match = comment.match(/^\{([\w-]+)\} (.*): (.*)$/);
                if (match) {
                    const [, field, key, value] = match;
                    placeholders[field] = placeholders[field] || {};
                    placeholders[field][key] = value;
                } else {
                    description += comment;
                }
            }

            srcArb[key] = srcString;
            srcArb['@' + key] = {
                description,
                type: 'text',
                placeholders,
            };

            if (targetLanguage) {
                trgArb[key] = trgString;
                trgArb['@' + key] = {
                    description,
                    type: 'text',
                    placeholders,
                };
            }
        }
    }

    srcArb['@@locale'] = sourceLanguage.replace('-', '_');
    srcArb['@@last_modified'] = new Date(Date.now()).toISOString();

    if (targetLanguage) {
        trgArb['@@locale'] = targetLanguage.replace('-', '_');
        trgArb['@@last_modified'] = new Date(Date.now()).toISOString();
    }

    const source = JSON.stringify(srcArb, null, 2);
    const target = targetLanguage ? JSON.stringify(trgArb, null, 2) : '';

    return {
        source,
        target,
        original,
        sourceLanguage,
        targetLanguage,
    };
}

// YEAR-MO-DA HO:MI+ZONE, e.g. 2008-07-22 18:13+0200
export function formatDate(date: Date) {
    return `${date.getFullYear()}-${zeroPad(date.getMonth() + 1)}-${zeroPad(date.getDate())} ${zeroPad(date.getHours())}:${zeroPad(date.getMinutes())}${timezoneOffset(date)}`;
}

export function timezoneOffset(date: Date): string {
    const offset = date.getTimezoneOffset();
    const sign = offset <= 0 ? '+' : '-';
    const hours = Math.floor(Math.abs(offset) / 60);
    const minutes = Math.abs(offset) % 60;

    return sign + zeroPad(hours) + zeroPad(minutes);
}

export function gettextComment(prefix: string, value: string, maxCharWidth: number) {
    const splitValue = [];

    while (value.length > maxCharWidth - prefix.length - 1) {
        splitValue.push(prefix + ' ' + value.substr(0, maxCharWidth - prefix.length - 1));
        value = value.substr(maxCharWidth - prefix.length - 1);
    }
    splitValue.push(`${prefix} ${value}`);

    return splitValue.join('\n');
}

export function gettextString(prefix: string, value: string, maxCharWidth: number) {
    value = value.replace(/\n/, '\\n');

    if (value.length <= maxCharWidth - prefix.length - 3) {
        return `${prefix} "${value}"`;
    }

    const splitValue = [`${prefix} ""`];
    while (value.length > maxCharWidth - prefix.length - 2) {
        splitValue.push(`"${value.substr(0, maxCharWidth - 2)}"`);
        value = value.substr(maxCharWidth - 2);
    }
    splitValue.push(`"${value}"`);

    return splitValue.join('\n');
}

interface GettextEntry {
    translatorCommentLines: string[];
    extractedCommentLines: string[];
    references: string[];
    flags: string[];
    msgctxt: string;
    msgid: string;
    msgstr: string;
}

export interface Gettext extends Array<GettextEntry> {}

export function gettextToJs(content: string): Gettext {
    const result: Gettext = [];
    let multilineScope = '';
    let translatorCommentLines: string[] = [];
    let extractedCommentLines: string[] = [];
    let references: string[] = [];
    let flags: string[] = [];
    let msgctxt = '';
    let msgid = '';
    let msgstr = '';

    for (const line of content.split('\n')) {
        if (line.trim() === '') {
            // End of block
            result.push({
                translatorCommentLines,
                extractedCommentLines,
                references,
                flags,
                msgctxt,
                msgid,
                msgstr,
            });

            // Reset
            multilineScope = '';
            translatorCommentLines = [];
            extractedCommentLines = [];
            references = [];
            flags = [];
            msgctxt = '';
            msgid = '';
            msgstr = '';

            continue;
        }

        if (multilineScope !== '') {
            if (line.startsWith('"')) {
                const text = line.substr(1, line.length-2);

                switch (multilineScope) {
                    case 'msgctxt':
                        msgctxt += text;
                        break;

                    case 'msgid':
                        msgid += text;
                        break;

                    case 'msgstr':
                        msgstr += text;
                        break;
                }
            } else {
                multilineScope = '';
            }
        }

        const prefix = line.substr(0, line.indexOf(' '));
        const text = line.substr(line.indexOf(' ')+1);

        switch (prefix) {
            case '#':
                translatorCommentLines.push(text);
                break;

            case '#.':
                extractedCommentLines.push(text);
                break;

            case '#:':
                references = references.concat(text.split(',').map(part => part.trim()));
                break;

            case '#,':
                flags = flags.concat(text.split(',').map(part => part.trim()));
                break;

            case 'msgctxt':
                if (text === '""') {
                    multilineScope = prefix;
                } else {
                    msgctxt = text.substr(1, text.length-2);
                }
                break;

            case 'msgid':
                if (text === '""') {
                    multilineScope = prefix;
                } else {
                    msgid = text.substr(1, text.length-2);
                }
                break;

            case 'msgstr':
                if (text === '""') {
                    multilineScope = prefix;
                } else {
                    msgstr = text.substr(1, text.length-2);
                }
                break;
        }
    }

    return result;
}
