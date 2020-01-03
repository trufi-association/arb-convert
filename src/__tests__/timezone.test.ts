describe('Timezones', () => {
  test('timezone should always be UTC', () => {
    expect(new Date().getTimezoneOffset()).toBe(0);
  });
});
