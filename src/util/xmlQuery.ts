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
type FilterCallbackFunc<T> = (value: T, index: number, array: T[]) => boolean;
type Predicate = string | number | FilterCallbackFunc<XmlQueryNode<any>>;
type XmlQueryNode<T> = Element & {
    __xmlQuery: true,
    originalNode: T;
    innerElements: () => Element[];
    innerText: () => string;
    query: (predicate: Predicate) => XmlQueryNode<T>;
    queryAll: (predicate: Predicate) => XmlQueryNode<T>;
    map: (callbackfn: MapCallbackFunc<XmlQueryNode<T>>, thisArg?: any) => XmlQueryNode<T>;
    forEach: (callbackfn: ForeachCallbackFunc<XmlQueryNode<T>>, thisArg?: any) => void;
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
    }
    if ('__xmlQuery' in node) {
        return node;
    }
    if (Array.isArray(node)) {
        wrappedNode.elements = node;
    } else {
        Object.assign(wrappedNode, node);
    }

    wrappedNode.innerElements = innerElements.bind<any>(wrappedNode);
    wrappedNode.innerText = innerText.bind<any>(wrappedNode);
    wrappedNode.query = query.bind<any>(wrappedNode);
    wrappedNode.queryAll = queryAll.bind<any>(wrappedNode);
    wrappedNode.forEach = forEach.bind<any>(wrappedNode);
    wrappedNode.map = map.bind<any>(wrappedNode);

    return wrappedNode as XmlQueryNode<typeof node>;
}

function innerElements<T>(this: XmlQueryNode<T>) {
    return Array.isArray(this.originalNode)
        ? this.elements!.flatMap(el => el.elements || [])
        : this.elements!;
}

function innerText<T>(this: XmlQueryNode<T>) {
    return this.innerElements()
        .filter(el => el.type === 'text')
        .map(el => el.text)
        .join('');
}

function query<T>(this: XmlQueryNode<T>, predicate: Predicate) {
    switch (typeof predicate) {
        case 'string':
            return xmlQuery(
                this.innerElements()
                    .map(xmlQuery)
                    .find(el => el.name === predicate)
            );

        case 'number':
            return xmlQuery(
                this.innerElements()
                    .map(xmlQuery)
                    [predicate]
            );

        default:
            return xmlQuery(
                this.innerElements()
                    .map(xmlQuery)
                    .find(predicate)
                );
    }
}

function queryAll<T>(this: XmlQueryNode<T>, predicate: Predicate) {
    switch (typeof predicate) {
        case 'string':
            return xmlQuery(
                this.innerElements()
                    .map(xmlQuery)
                    .filter(el => el.name === predicate)
            );

        case 'number':
            return xmlQuery([
                this.innerElements()
                    .map(xmlQuery)
                    [predicate]
            ]);

        default:
            return xmlQuery(
                this.innerElements()
                    .map(xmlQuery)
                    .filter(predicate)
            );
    }
}

function forEach<T>(this: XmlQueryNode<T>, cb: ForeachCallbackFunc<XmlQueryNode<Element[]>>, thisArg?: any): void {
    return this.elements!
        .map(xmlQuery)
        .forEach(cb, thisArg);
}

function map<T>(this: XmlQueryNode<T>, cb: MapCallbackFunc<XmlQueryNode<Element[]>>, thisArg?: any): XmlQueryNode<any> {
    return xmlQuery(
        this.elements!
            .map(xmlQuery)
            .map(cb, thisArg)
    );
}
