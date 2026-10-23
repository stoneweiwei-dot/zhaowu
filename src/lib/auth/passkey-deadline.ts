/** Fail closed when a browser WebAuthn prompt or owner-session request never settles. */
export const PASSKEY_REQUEST_TIMEOUT_MS = 15_000;
export const PASSKEY_CEREMONY_TIMEOUT_MS = 45_000;

export async function runPasskeyWithDeadline<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number,
): Promise<T> {
  const controller = new AbortController();
  let didTimeout = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  // Some embedded/desktop browsers ignore an aborted WebAuthn operation.
  // Promise.race releases the UI even when the browser never settles it.
  const deadline = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      didTimeout = true;
      controller.abort();
      reject(new Error("PASSKEY_TIMEOUT"));
    }, timeoutMs);
  });
  try {
    return await Promise.race([Promise.resolve().then(() => operation(controller.signal)), deadline]);
  } catch (error) {
    if (didTimeout) throw new Error("PASSKEY_TIMEOUT");
    throw error;
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}
