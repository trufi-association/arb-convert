// 2019-12-31T16:00:00.000Z
// 2019-12-31T17:00:00.000+01:00
const DEFAULT_NOW = 1577808000000;

export default function mockDateNow(date?: Date) {
    const now = date ? date.getTime() : DEFAULT_NOW;
    const spy = jest.spyOn(Date, 'now').mockImplementation(() => now);
    return { now, spy };
}
