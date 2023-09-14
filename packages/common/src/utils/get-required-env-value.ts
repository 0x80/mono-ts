import { isDefined } from "ts-is-present";
import { assert } from "./assert.js";

export function getRequiredEnvValue(name: string) {
  const value = process.env[name];

  assert(isDefined(value), `Missing env variable ${name}`);

  return value;
}
