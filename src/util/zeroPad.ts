export default function zeroPad(value: string | number, length = 2): string {
    value = String(value);

    while (value.length < length) {
        value = '0' + value;
    }

    return value;
}
