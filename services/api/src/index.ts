/**
 * Logger compat is required to have console methods connected to Google cloud
 * logging.
 */
import "firebase-functions/logger/compat";

export * from "./server";
