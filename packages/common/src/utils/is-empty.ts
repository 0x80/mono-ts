/**
 * Arrays only. Typically isEmpty does more than that, but we don't need it
 * here.
 */
export function isEmpty(array: unknown[]): array is [] {
  return array.length === 0;
}
