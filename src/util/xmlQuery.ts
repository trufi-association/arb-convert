import { Element } from "xml-js";

// Allows to move from node to node using a predicate in a
// graceful way
//
// E.g. xmlQuery(node)
//        .queryAll('foo') // result might be undefined
//        .query(el => el.attributes.bar === 'baz) // result might be undefined
//        .originalNode; // node

type MapCallbackFunc<T,> = (value: T, index: number, array: T[]) => any;
type ForeachCallbackFunc<T> = (value: T, index: number, array: T[]) => void;
type FilterCallback<T> = (value: T) => boolean;
type Predicate = string | number | FilterCallback<XmlQueryNode<any>>;
type XmlQueryNode<T> = Element & {
    __xmlQuery: true,
    originalNode: T;
    query: (predicate: Predicate) => XmlQueryNode<T>;
    queryAll: (predicate: Predicate) => XmlQueryNode<T>;
    map: (callbackfn: MapCallbackFunc<XmlQueryNode<T>>, thisArg?: any) => XmlQueryNode<T>;
    forEach: (callbackfn: ForeachCallbackFunc<XmlQueryNode<T>>, thisArg?: any) => void;
    innerText: () => string;
};
type AllowedInput = Element | Element[] | XmlQueryNode<any> | string | number | undefined;


export default function xmlQuery(node: AllowedInput) {
    const wrappedNode: Partial<XmlQueryNode<typeof node>> = {
        __xmlQuery: true,
        originalNode: node,
        attributes: {}, // default
        elements: [], // default
    };

    if (node == null || typeof node === 'string' || typeof node === 'number') {
        return wrappedNode as XmlQueryNode<typeof node>;
    } else if ('__xmlQuery' in node) {
        return node;
    } else if (Array.isArray(node)) {
        const elements = node.flatMap(nd => nd.elements || []);
        wrappedNode.elements = elements;

        wrappedNode.query = query.bind(wrappedNode, elements);
        wrappedNode.queryAll = queryAll.bind(wrappedNode, elements);
        wrappedNode.forEach = forEach.bind(wrappedNode, node);
        wrappedNode.map = map.bind(wrappedNode, node);
        wrappedNode.innerText = innerText.bind(wrappedNode, elements);
    } else {
        Object.assign(wrappedNode, node);
        const elements = node.elements || [];

        wrappedNode.query = query.bind(wrappedNode, elements);
        wrappedNode.queryAll = queryAll.bind(wrappedNode, elements);
        wrappedNode.forEach = forEach.bind(wrappedNode, elements);
        wrappedNode.map = map.bind(wrappedNode, elements);
        wrappedNode.innerText = innerText.bind(wrappedNode, elements);
    }

    return wrappedNode as XmlQueryNode<typeof node>;
}

function query(elements: Element[], predicate: Predicate) {
    switch (typeof predicate) {
        case 'string':
            return xmlQuery(
                elements
                    .map(xmlQuery)
                    .find(el => el.name === predicate)
            );

        case 'number':
            return xmlQuery(
                elements[predicate]
            );

        default:
            return xmlQuery(elements.map(xmlQuery).find(predicate));
    }
}

function queryAll(elements: Element[], predicate: Predicate) {
    switch (typeof predicate) {
        case 'string':
            return xmlQuery(
                elements
                    .map(xmlQuery)
                    .filter(el => el.name === predicate)
            );

        case 'number':
            return xmlQuery(
                elements[predicate]
            );

        default:
            return xmlQuery(
                elements
                    .map(xmlQuery)
                    .filter(predicate)
            );
    }
}

function forEach(elements: Element[], cb: ForeachCallbackFunc<XmlQueryNode<Element[]>>, thisArg?: any): void {
    return elements
        .map(xmlQuery)
        .forEach(cb, thisArg);
}

function map(elements: Element[], cb: MapCallbackFunc<XmlQueryNode<Element[]>>, thisArg?: any): XmlQueryNode<any> {
    return xmlQuery(
        elements
            .map(xmlQuery)
            .map(cb, thisArg)
    );
}

function innerText(elements: Element[]) {
    return elements
        .filter(el => el.type === 'text')
        .map(el => el.text)
        .join('');
}
