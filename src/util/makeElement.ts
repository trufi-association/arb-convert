import { Attributes, Element } from 'xml-js';

export default function makeElement(
  name: string,
  attributes: Attributes,
  children: Element[],
): Element {
  return {
    type: 'element',
    name,
    attributes,
    elements: children,
  };
}
