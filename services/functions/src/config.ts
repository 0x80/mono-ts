import { RuntimeOptions } from "firebase-functions";

/**
 * Normally I would use project env name matching here to allocate more
 * resources for production environments.
 */
export const isProduction = false;

export const region = isProduction ? "us-central1" : "europe-west3";

const low: RuntimeOptions = {
  timeoutSeconds: 300,
  memory: "512MB",
  minInstances: isProduction ? 2 : 0,
};

const mid: RuntimeOptions = {
  timeoutSeconds: 300,
  memory: isProduction ? "2GB" : "1GB",
  minInstances: isProduction ? 2 : 0,
};

const high: RuntimeOptions = {
  timeoutSeconds: 540,
  memory: isProduction ? "4GB" : "2GB",
  minInstances: isProduction ? 4 : 0,
};

const highest: RuntimeOptions = {
  timeoutSeconds: 540,
  memory: isProduction ? "8GB" : "4GB",
  minInstances: isProduction ? 4 : 0,
};

export const cfRuntime = {
  low,
  mid,
  high,
  highest,
} as const;
