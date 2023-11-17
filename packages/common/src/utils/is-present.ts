/**
 * Copied from ts-is-present
 */
export function isPresent<T>(t: T | undefined | null | void): t is T {
  return t !== undefined && t !== null;
}

export function isDefined<T>(t: T | undefined): t is T {
  return t !== undefined;
}

export function isFilled<T>(t: T | null): t is T {
  return t !== null;
}
