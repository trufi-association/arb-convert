import parseLocale from '../parseLocale';

test('locales are parsed correctly from strings', () => {
    expect(parseLocale()).toBeUndefined();
    expect(parseLocale(undefined)).toBeUndefined();
    expect(parseLocale('nothing valid')).toBeUndefined();
    expect(parseLocale('de_DE')).toBe('de-DE');
    expect(parseLocale('some string with a en-US locale inside')).toBe('en-US');
    expect(parseLocale('multiple', 'candidates', 'it-IT', 'this is not matched')).toBe('it-IT');
});
