import zeroPad from '../zeroPad';

test('zeroPad with default length', () => {
    expect(zeroPad(1)).toBe('01');
    expect(zeroPad('1')).toBe('01');
    expect(zeroPad(10)).toBe('10');
    expect(zeroPad('10')).toBe('10');
    expect(zeroPad(100)).toBe('100');
    expect(zeroPad('100')).toBe('100');
});

test('zeroPad with custom length', () => {
    const length = 5;

    expect(zeroPad(1, length)).toBe('00001');
    expect(zeroPad('1', length)).toBe('00001');
    expect(zeroPad(10, length)).toBe('00010');
    expect(zeroPad('10', length)).toBe('00010');
    expect(zeroPad(100, length)).toBe('00100');
    expect(zeroPad('100', length)).toBe('00100');
});
