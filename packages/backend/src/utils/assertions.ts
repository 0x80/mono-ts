import { assert } from "@sindresorhus/is";
declare type PropertyKey = string | number | symbol;

/**
 * This is just to test including a dependency that the others do not have, to
 * see if it ends up getting installed with the isolated output
 */
export function isPlainObject(
  value: unknown
): value is Record<PropertyKey, unknown> {
  assert.plainObject(value);

  return true;
}
