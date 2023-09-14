/**
 * Idea taken from https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript?ck_subscriber_id=553154891
 */

type ErrorWithMessage = {
  message: string;
};

export function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return typeof error === "object" && error !== null && "message" in error;
}

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError;

  try {
    return new Error(JSON.stringify(maybeError));
  } catch {
    /**
     * fallback in case there’s an error stringifying the maybeError
     * like with circular references for example.
     */
    return new Error(String(maybeError));
  }
}

export function getErrorMessage(error: unknown) {
  return toErrorWithMessage(error).message;
}
