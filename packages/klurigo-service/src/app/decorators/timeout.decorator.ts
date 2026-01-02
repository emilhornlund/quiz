import { SetMetadata } from '@nestjs/common'

/**
 * Metadata key for overriding the request timeout duration (in milliseconds).
 *
 * Used by {@link TimeoutInterceptor} to apply per-route or per-controller timeouts.
 */
export const TIMEOUT_MS_KEY = 'timeout_ms'

/**
 * Metadata key for disabling request timeouts entirely.
 *
 * Used by {@link TimeoutInterceptor} to bypass timeout enforcement for specific routes,
 * such as long-lived Server-Sent Events (SSE) endpoints.
 */
export const NO_TIMEOUT_KEY = 'no_timeout'

/**
 * Decorator for overriding the timeout applied by {@link TimeoutInterceptor}.
 *
 * When applied, the interceptor will enforce the provided timeout duration
 * for the request/response lifecycle.
 *
 * @param ms - The timeout duration in milliseconds.
 */
export const Timeout = (ms: number) => SetMetadata(TIMEOUT_MS_KEY, ms)

/**
 * Decorator for disabling the timeout applied by {@link TimeoutInterceptor}.
 *
 * This is primarily intended for long-lived streams (for example SSE) where the request
 * is expected to remain open beyond typical request/response time limits.
 */
export const NoTimeout = () => SetMetadata(NO_TIMEOUT_KEY, true)
