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

/**
 * Firebase functions still do not support native source maps, so we need to
 * install source-map-support to get stack traces in error reporting.
 */
import sourceMapSupport from "source-map-support";
sourceMapSupport.install();

export * from "./update-counter";
