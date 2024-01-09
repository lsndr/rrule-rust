export function* takeN<T>(iterable: Iterable<T>, length: number) {
  for (const item of iterable) {
    if (length-- <= 0) {
      break;
    }
    yield item;
  }
}
