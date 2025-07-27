export function bail(errorMessageFn: () => string): never {
  throw new Error(errorMessageFn());
}
