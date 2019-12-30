import { js2xml, xml2js, Element } from 'xml-js';
import { ConvertOptions, ParseOptions, ApplicationResourceBundle, ArbPlaceholders } from '../types';
import makeElement from '../util/makeElement';
import makeText from '../util/makeText';
import escapeValue from '../util/escapeValue';
import xmlQuery from '../util/xmlQuery';

export function convert({
    source,
    target,
    original,
    sourceLanguage,
    targetLanguage
}: ConvertOptions): ParseOptions {
    const sourceJs = JSON.parse(source);
    const targetJs = target ? JSON.parse(target) : null;

    const transUnits = Object.keys(sourceJs)
        .filter(key => key[0] !== '@')
        .map(key => {
            const sourceString = sourceJs[key];
            const targetString = targetJs && targetJs[key];
            const { description, placeholders } = sourceJs['@' + key];

            const children = [
                makeElement('source', {}, [makeText(sourceString)]),
            ];

            if (targetString) {
                children.push(
                    makeElement('target', {}, [makeText(targetString)])
                );
            }

            if (description) {
                children.push(
                    makeElement('note', { from: 'developer' }, [makeText(description)])
                );
            }

            if (Object.keys(placeholders).length > 0) {
                const contextGroupChildren: Element[] = [];

                Object.keys(placeholders).forEach(paramName =>
                    Object.keys(placeholders[paramName]).forEach(property =>
                        contextGroupChildren.push(
                            makeElement('context', {
                                'context-type': 'paramnotes',
                            }, [
                                makeText(`{${paramName}} ${property}: ${placeholders[paramName][property]}`),
                            ])
                        )
                    )
                );

                children.push(
                    makeElement('context-group', {
                        purpose: 'informational',
                    }, contextGroupChildren)
                );
            }

            return makeElement('trans-unit', { id: escapeValue(key) }, children);
        });

    const root = makeElement('xliff', {
        'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        'xsi:schemaLocation': 'urn:oasis:names:tc:xliff:document:1.2 http://docs.oasis-open.org/xliff/v1.2/os/xliff-core-1.2-strict.xsd',
        xmlns: 'urn:oasis:names:tc:xliff:document:1.2',
        version: '1.2',
    }, [
        makeElement('file', {
            original,
            datatype: 'plaintext',
            'xml:space': 'preserve',
            'source-language': sourceLanguage,
            'target-language': targetLanguage,
            date: new Date().toISOString(),
        }, [
            makeElement('body', {}, transUnits),
        ]),
    ]);

    const content = js2xml({
        elements: [root],
    }, {
        spaces: '  ',
    });

    return { content };
}

export function parse({ content }: ParseOptions): ConvertOptions {
    const srcArb: ApplicationResourceBundle = {};
    const trgArb: ApplicationResourceBundle = {};
    const xmlJsNode = xml2js(content) as Element;
    const parsedXml = xmlQuery(xmlJsNode);
    const xliff = parsedXml.query('xliff');
    const file = xliff.query('file');
    const original = file.attributes!.original as string;
    const sourceLanguage = file.attributes!['source-language'] as string;
    const targetLanguage = file.attributes!['target-language'] as string;
    const hasTarget = targetLanguage != null;

    srcArb['@@locale'] = sourceLanguage.replace('-', '_');
    srcArb['@@last_modified'] = new Date().toISOString();

    if (hasTarget) {
        trgArb['@@locale'] = targetLanguage.replace('-', '_');
        trgArb['@@last_modified'] = new Date().toISOString();
    }

    file
        .query('body')
        .queryAll('trans-unit')
        .forEach(transUnit => {
            const source = transUnit
                .query('source')
                .innerText();

            const target = transUnit
                .query('target')
                .innerText();

            const description = transUnit
                .query(el =>
                    el.name === 'note' &&
                    el.attributes?.from === 'developer'
                )
                .innerText();

            const placeholders: ArbPlaceholders = {};
            transUnit
                .queryAll(el =>
                    el.name === 'context-group' &&
                    el.attributes?.purpose === 'informational'
                )
                .queryAll(el => {
                    return el.name === 'context' &&
                    el.attributes?.['context-type'] === 'paramnotes'
                })
                .forEach(el => {
                    const match = el.innerText().match(/^\{([\w-]+)\} (.*): (.*)$/);
                    if (match) {
                        const [, key, type, value] = match;
                        placeholders[key] = {
                            [type]: value,
                        };
                    }
                });

            srcArb[transUnit.attributes!.id!] = source;
            srcArb['@' + transUnit.attributes!.id!] = {
                description,
                type: 'text',
                placeholders,
            };

            trgArb[transUnit.attributes!.id!] = target;
            trgArb['@' + transUnit.attributes!.id!] = {
                description,
                type: 'text',
                placeholders,
            };
        });

    const source = JSON.stringify(srcArb, null, 2);
    const target = hasTarget ? JSON.stringify(trgArb, null, 2) : '';

    return {
        source,
        target,
        original,
        sourceLanguage,
        targetLanguage,
    };
}
