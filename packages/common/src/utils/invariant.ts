export function invariant(condition: unknown, msg: string): asserts condition {
  if (!condition) {
    throw new Error(msg);
  }
}
