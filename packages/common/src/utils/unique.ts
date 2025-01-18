import * as R from "remeda";

export function unique<T extends readonly unknown[]>(array: T) {
  return R.unique(array);
}
