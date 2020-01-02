import escapeValue from '../escapeValue';

test('escapes values with special characters properly', () => {
  expect(escapeValue('<foo bar="baz" oh=\'yeah\'>&amp;</foo>'))
    .toBe('&lt;foo bar=&quot;baz&quot; oh=&apos;yeah&apos;&gt;&amp;amp;&lt;/foo&gt;');
});
