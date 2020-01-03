export default function zeroPad(value: string | number, length = 2): string {
  let val = String(value);

  while (val.length < length) {
    val = `0${val}`;
  }

  return val;
}
