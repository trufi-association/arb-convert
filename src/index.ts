import { convert as convertGettext, parse as parseGettext } from './formats/gettext';
import { convert as convertToXliff1, parse as parseXliff1 } from './formats/xliff-1_2';
import { convert as convertToXliff2, parse as parseXliff2 } from './formats/xliff-2_1';
import { IConvertOptions, IParseOptions } from './types';

export function convertFromArb(format: string, options: IConvertOptions): IParseOptions {
  const defaultOptions: Partial<IConvertOptions> = {
    original: 'application resource bundle',
    sourceLanguage: 'en-US',
  };
  const opts = {
    ...defaultOptions,
    ...options,
  };

  switch (format) {
    case 'xliff':
    case 'xliff-1.x':
    case 'xliff-1.2':
      return convertToXliff1(opts);

    case 'xliff-2.x':
    case 'xliff-2.0':
    case 'xliff-2.1':
      return convertToXliff2(opts);

    case 'gettext':
      return convertGettext(opts);

    default:
      throw new Error(`Format ${format} is not supported`);
  }
}

export function parseToArb(format: string, options: IParseOptions): IConvertOptions {
  switch (format) {
    case 'xliff': {
      const matches = options.content.match(/urn:oasis:names:tc:xliff:document:(\d\.\d)/);
      const version = matches && matches[1];

      if (version) {
        return parseToArb(`xliff-${version}`, options);
      }
      throw new Error('Could not determine XLIFF version');
    }

    case 'xliff-1.x':
    case 'xliff-1.2':
      return parseXliff1(options);

    case 'xliff-2.x':
    case 'xliff-2.0':
    case 'xliff-2.1':
      return parseXliff2(options);

    case 'gettext':
      return parseGettext(options);

    default:
      throw new Error(`Format ${format} is not supported`);
  }
}
