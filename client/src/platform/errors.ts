import type { ApiFailure, ApiMeta, ApiResult } from "./contracts";

export class PlatformApiError extends Error {
  readonly code: string;
  readonly messageKey: string;
  readonly requestId?: string;
  readonly retryable: boolean;

  constructor(failure: ApiFailure) {
    super(failure.error.messageKey);
    this.name = "PlatformApiError";
    this.code = failure.error.code;
    this.messageKey = failure.error.messageKey;
    this.requestId = failure.meta.requestId;
    this.retryable = failure.error.retryable ?? false;
  }
}

export function createApiMeta(locale: "en" | "ar", requestId = crypto.randomUUID()): ApiMeta {
  return { requestId, generatedAt: new Date().toISOString(), locale };
}

export function unwrapApiResult<T>(result: ApiResult<T>): T {
  if (!result.ok) throw new PlatformApiError(result);
  return result.data;
}

export function failureResult<T>(
  locale: "en" | "ar",
  code: string,
  messageKey: string,
  details?: Record<string, unknown>,
): ApiResult<T> {
  return {
    ok: false,
    error: { code, messageKey, details },
    meta: createApiMeta(locale),
  };
}
