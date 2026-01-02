import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  RequestTimeoutException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable, throwError, TimeoutError } from 'rxjs'
import { catchError, timeout } from 'rxjs/operators'

import { NO_TIMEOUT_KEY, TIMEOUT_MS_KEY } from '../decorators'

/**
 * Global interceptor that enforces a maximum request processing duration for
 * standard HTTP request/response endpoints.
 *
 * Behavior:
 * - Applies a default timeout of 5000 ms unless overridden via {@link Timeout}.
 * - Can be disabled via {@link NoTimeout} on a controller or handler.
 * - Skips timeout enforcement for SSE endpoints detected via the `Accept:
 *   text/event-stream` header, since these connections are intentionally long-lived.
 *
 * When the timeout is exceeded, a {@link RequestTimeoutException} is raised.
 */
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  /**
   * Creates a new {@link TimeoutInterceptor}.
   *
   * @param reflector - Used to read timeout metadata set by {@link Timeout} and {@link NoTimeout}.
   */
  constructor(private readonly reflector: Reflector) {}

  /**
   * Intercepts the outgoing handler observable and enforces a timeout when applicable.
   *
   * @param context - The current execution context.
   * @param next - The next handler in the request pipeline.
   * @returns The handler observable, optionally wrapped with timeout enforcement.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const noTimeout = this.reflector.getAllAndOverride<boolean>(
      NO_TIMEOUT_KEY,
      [context.getHandler(), context.getClass()],
    )

    if (noTimeout) {
      return next.handle()
    }

    const timeoutMs =
      this.reflector.getAllAndOverride<number>(TIMEOUT_MS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? 5000

    const req = context.switchToHttp().getRequest()
    const accept = (req?.headers?.accept ?? '') as string

    const isSse = accept.includes('text/event-stream')

    if (isSse) {
      return next.handle()
    }

    return next.handle().pipe(
      timeout(timeoutMs),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException())
        }
        return throwError(() => err)
      }),
    )
  }
}
