import { ConvertOptions, ParseOptions } from './types';
import { convert as convertToXliff1_2 } from './formats/xliff-1_2';
import { convert as convertToXliff2_1 } from './formats/xliff-2_1';

export function convertFromArb(format: string, options: ConvertOptions): ParseOptions {
    const defaultOptions: Partial<ConvertOptions> = {
        original: 'application resource bundle',
        sourceLanguage: 'en-US',
    };
    options = {
        ...defaultOptions,
        ...options,
    };

    switch (format) {
        case 'xliff':
        case 'xliff-1.x':
        case 'xliff-1.2':
            return convertToXliff1_2(options);

        case 'xliff-2.x':
        case 'xliff-2.0':
        case 'xliff-2.1':
            return convertToXliff2_1(options);

        default:
            throw new Error(`Format ${format} is not supported`);
    }
}

export function parseToArb(format: string, options: ParseOptions): ConvertOptions {
    switch (format) {
        case 'xliff':
            const matches = options.content.match(/urn:oasis:names:tc:xliff:document:(\d\.\d)/);
            const version = matches && matches[1];

            if (version) {
                return parseToArb(`xliff-${version}`, options);
            } else {
                throw new Error('Could not determine XLIFF version');
            }

        case 'xliff-1.x':
        case 'xliff-1.2':
            const { parse: parseXliff1_2 } = require('./formats/xliff-1_2');
            return parseXliff1_2(options);

        case 'xliff-2.x':
        case 'xliff-2.0':
        case 'xliff-2.1':
            const { parse: parseXliff2_1 } = require('./formats/xliff-2_1');
            return parseXliff2_1(options);

        default:
            throw new Error(`Format ${format} is not supported`);
    }
}
