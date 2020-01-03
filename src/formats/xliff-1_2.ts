import { Element, js2xml, xml2js } from 'xml-js';
import {
  IApplicationResourceBundle,
  IArbPlaceholders,
  IConvertOptions,
  IParseOptions,
} from '../types';
import escapeValue from '../util/escapeValue';
import makeElement from '../util/makeElement';
import makeText from '../util/makeText';
import xmlQuery from '../util/xmlQuery';

export function convert({
  source,
  target,
  original,
  sourceLanguage,
  targetLanguage,
}: IConvertOptions): IParseOptions {
  const sourceJs = JSON.parse(source);
  const targetJs = target ? JSON.parse(target) : null;

  const transUnits = Object.keys(sourceJs)
    .filter(key => key[0] !== '@')
    .map(key => {
      const sourceString = sourceJs[key];
      const targetString = targetJs && targetJs[key];
      const { description, placeholders } = sourceJs[`@${key}`];

      const children = [
        makeElement('source', {}, [makeText(sourceString)]),
      ];

      if (targetString) {
        children.push(
          makeElement('target', {}, [makeText(targetString)]),
        );
      }

      if (description) {
        children.push(
          makeElement('note', { from: 'developer' }, [makeText(description)]),
        );
      }

      if (Object.keys(placeholders).length > 0) {
        const contextGroupChildren: Element[] = [];

        Object.keys(placeholders).forEach(paramName => {
          Object.keys(placeholders[paramName]).forEach(property => {
            contextGroupChildren.push(
              makeElement('context', {
                'context-type': 'paramnotes',
              }, [
                makeText(`{${paramName}} ${property}: ${placeholders[paramName][property]}`),
              ]),
            );
          });
        });

        children.push(
          makeElement('context-group', {
            purpose: 'informational',
          }, contextGroupChildren),
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
      date: new Date(Date.now()).toISOString(),
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

export function parse({ content }: IParseOptions): IConvertOptions {
  const srcArb: IApplicationResourceBundle = {};
  const trgArb: IApplicationResourceBundle = {};
  const xmlJsNode = xml2js(content) as Element;
  const parsedXml = xmlQuery(xmlJsNode);
  const xliff = parsedXml.query('xliff');
  const file = xliff.query('file');
  const original = String(file.attributes!.original || '');
  const sourceLanguage = String(file.attributes!['source-language'] || '');
  const targetLanguage = String(file.attributes!['target-language'] || '');

  srcArb['@@locale'] = sourceLanguage.replace('-', '_');
  srcArb['@@last_modified'] = new Date(Date.now()).toISOString();

  if (targetLanguage) {
    trgArb['@@locale'] = targetLanguage.replace('-', '_');
    trgArb['@@last_modified'] = new Date(Date.now()).toISOString();
  }

  file
    .query('body')
    .queryAll('trans-unit')
    .forEach(transUnit => {
      const sourceText = transUnit
        .query('source')
        .innerText();

      const targetText = transUnit
        .query('target')
        .innerText();

      const description = transUnit
        .query(el => el.name === 'note'
                    && el.attributes != null
                    && el.attributes.from === 'developer')
        .innerText();

      const placeholders: IArbPlaceholders = {};
      transUnit
        .queryAll(el => el.name === 'context-group'
                    && el.attributes != null
                    && el.attributes.purpose === 'informational')
        .queryAll(el => el.name === 'context'
                    && el.attributes != null
                    && el.attributes['context-type'] === 'paramnotes')
        .forEach(el => {
          const match = el.innerText().match(/^\{([\w-]+)\} (.*): (.*)$/);
          if (match) {
            const [, key, type, value] = match;
            placeholders[key] = {
              [type]: value,
            };
          }
        });

      srcArb[transUnit.attributes!.id!] = sourceText;
      srcArb[`@${transUnit.attributes!.id!}`] = {
        description,
        type: 'text',
        placeholders,
      };

      trgArb[transUnit.attributes!.id!] = targetText;
      trgArb[`@${transUnit.attributes!.id!}`] = {
        description,
        type: 'text',
        placeholders,
      };
    });

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
