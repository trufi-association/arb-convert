import {
  IApplicationResourceBundle,
  IArbPlaceholders,
  IConvertOptions,
  IParseOptions,
} from '../types';
import zeroPad from '../util/zeroPad';

const MAX_CHAR_WIDTH = 80;

export function convert({
  source,
  target,
  original,
  sourceLanguage,
  targetLanguage,
}: IConvertOptions): IParseOptions {
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
      const { description, placeholders } = sourceJs[`@${key}`];

      content += '\n';

      if (description) {
        content += `\n${gettextComment('#.', description, MAX_CHAR_WIDTH)}`;
      }

      Object.keys(placeholders).forEach(paramName => {
        Object.keys(placeholders[paramName]).forEach(property => {
          const example = `{${paramName}} ${property}: ${placeholders[paramName][property]}`;
          content += `\n${gettextComment('#.', example, MAX_CHAR_WIDTH)}`;
        });
      });

      content += `\n${gettextString('msgctxt', key, MAX_CHAR_WIDTH)}`;
      content += `\n${gettextString('msgid', sourceString, MAX_CHAR_WIDTH)}`;
      content += `\n${gettextString('msgstr', targetString, MAX_CHAR_WIDTH)}`;
    });

  content += '\n';

  return { content };
}

export function parse({ content }: IParseOptions): IConvertOptions {
  const gettext = gettextToJs(content);
  const srcArb: IApplicationResourceBundle = {};
  const trgArb: IApplicationResourceBundle = {};

  let original = '';
  let sourceLanguage = 'en-US';
  let targetLanguage = '';

  srcArb['@@locale'] = '';
  srcArb['@@last_modified'] = '';
  trgArb['@@locale'] = '';
  trgArb['@@last_modified'] = '';

  gettext.forEach(entry => {
    // Header
    if (entry.msgctxt === '' && entry.msgid === '') {
      entry.translatorCommentLines.forEach(comment => {
        if (comment.startsWith('original: ')) {
          original = comment.substr(10);
        } else if (comment.startsWith('srcLang: ')) {
          sourceLanguage = comment.substr(9);
        } else if (comment.startsWith('trgLang: ')) {
          targetLanguage = comment.substr(9);
        }
      });
    } else {
      const key = entry.msgctxt.replace('\\n', '\n');
      const srcString = entry.msgid.replace('\\n', '\n');
      const trgString = entry.msgstr.replace('\\n', '\n');
      const placeholders: IArbPlaceholders = {};
      let description = '';

      entry.extractedCommentLines.forEach(comment => {
        const match = comment.match(/^\{([\w-]+)\} (.*): (.*)$/);
        if (match) {
          const [, field, name, value] = match;
          placeholders[field] = placeholders[field] || {};
          placeholders[field][name] = value;
        } else {
          description += comment;
        }
      });

      srcArb[key] = srcString;
      srcArb[`@${key}`] = {
        description,
        type: 'text',
        placeholders,
      };

      if (targetLanguage) {
        trgArb[key] = trgString;
        trgArb[`@${key}`] = {
          description,
          type: 'text',
          placeholders,
        };
      }
    }
  });

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
  let val = value;

  while (val.length > maxCharWidth - prefix.length - 1) {
    splitValue.push(`${prefix} ${val.substr(0, maxCharWidth - prefix.length - 1)}`);
    val = val.substr(maxCharWidth - prefix.length - 1);
  }
  splitValue.push(`${prefix} ${val}`);

  return splitValue.join('\n');
}

export function gettextString(prefix: string, value: string, maxCharWidth: number) {
  let val = value.replace(/\n/, '\\n');

  if (val.length <= maxCharWidth - prefix.length - 3) {
    return `${prefix} "${val}"`;
  }

  const splitValue = [`${prefix} ""`];
  while (val.length > maxCharWidth - prefix.length - 2) {
    splitValue.push(`"${val.substr(0, maxCharWidth - 2)}"`);
    val = val.substr(maxCharWidth - 2);
  }
  splitValue.push(`"${val}"`);

  return splitValue.join('\n');
}

interface IGettextEntry {
  translatorCommentLines: string[];
  extractedCommentLines: string[];
  references: string[];
  flags: string[];
  msgctxt: string;
  msgid: string;
  msgstr: string;
}

export interface IGettext extends Array<IGettextEntry> { }

export function gettextToJs(content: string): IGettext {
  const result: IGettext = [];
  let multilineScope = '';
  let translatorCommentLines: string[] = [];
  let extractedCommentLines: string[] = [];
  let references: string[] = [];
  let flags: string[] = [];
  let msgctxt = '';
  let msgid = '';
  let msgstr = '';

  content.split('\n').forEach(line => {
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

      return;
    }

    if (multilineScope !== '') {
      if (line.startsWith('"')) {
        const continuedText = line.substr(1, line.length - 2);

        // eslint-disable-next-line default-case
        switch (multilineScope) {
          case 'msgctxt':
            msgctxt += continuedText;
            break;

          case 'msgid':
            msgid += continuedText;
            break;

          case 'msgstr':
            msgstr += continuedText;
            break;
        }
      } else {
        multilineScope = '';
      }
    }

    const prefix = line.substr(0, line.indexOf(' '));
    const text = line.substr(line.indexOf(' ') + 1);

    // eslint-disable-next-line default-case
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
          msgctxt = text.substr(1, text.length - 2);
        }
        break;

      case 'msgid':
        if (text === '""') {
          multilineScope = prefix;
        } else {
          msgid = text.substr(1, text.length - 2);
        }
        break;

      case 'msgstr':
        if (text === '""') {
          multilineScope = prefix;
        } else {
          msgstr = text.substr(1, text.length - 2);
        }
        break;
    }
  });

  return result;
}
