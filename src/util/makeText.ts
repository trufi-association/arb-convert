import { Element } from "xml-js";

export default function makeText(text: string): Element {
    return {
        type: 'text',
        text,
    };
}
