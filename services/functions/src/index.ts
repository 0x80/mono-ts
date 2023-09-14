/**
 * This file exports all cloud functions and forms the entry point for Firebase
 * functions deployment, as referenced in package.json > main.
 *
 * Every feature folder only exports its functions at the top level.
 *
 * Logger compat is required to have console methods connected to Google cloud
 * logging.
 */
import "firebase-functions/logger/compat";

export * from "./counter-on-write.js";
