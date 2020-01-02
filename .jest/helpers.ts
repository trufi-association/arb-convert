const helpers = {
    mockDateNow: (date?: Date) => {
        // 2019-12-31T16:00:00.000Z
        const DEFAULT_NOW = 1577808000000;
        const now = date ? date.getTime() : DEFAULT_NOW;
        const spy = jest.spyOn(Date, 'now').mockImplementation(() => now);
        return { now, spy };
    },
};

Object.assign(global, helpers);
