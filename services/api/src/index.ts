/**
 * Firebase functions still do not support native source maps, so we need to
 * install source-map-support to get stack traces in error reporting.
 */
import sourceMapSupport from "source-map-support";
sourceMapSupport.install();

/**
 * Logger compat is required to have console methods connected to Google cloud
 * logging.
 */
import "firebase-functions/logger/compat";

export * from "./server.ts";
