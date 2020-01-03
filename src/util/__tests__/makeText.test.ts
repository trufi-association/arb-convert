import { Element } from 'xml-js';
import makeText from '../makeText';

test('text node having the correct structure', () => {
  const node = makeText('wubba lubba dub dub');

  expect(node).toMatchObject<Element>({
    type: 'text',
    text: 'wubba lubba dub dub',
  });
});
