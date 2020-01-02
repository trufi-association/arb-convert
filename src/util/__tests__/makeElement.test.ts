import { Element } from 'xml-js';
import makeElement from '../makeElement';

test('element node having the correct structure', () => {
    const element = makeElement('foo', {
        foo: 'bar',
        hell: 'yeah',
    }, [
        makeElement('first', {}, []),
        makeElement('second', {}, []),
        makeElement('third', {}, []),
    ]);

    expect(element).toMatchObject<Element>({
        name: 'foo',
        type: 'element',
        attributes: {
            foo: 'bar',
            hell: 'yeah',
        },
        elements: [
            { name: 'first', type: 'element' },
            { name: 'second', type: 'element' },
            { name: 'third', type: 'element' },
        ],
    });
});

