import { map } from 'rxjs/operators';
import { Response, Request } from 'express';
import {
  Injectable,
  CallHandler,
  NestInterceptor,
  ExecutionContext,
} from '@nestjs/common';

interface ApiResponse {
  message?: string;
  data?: unknown;
  meta?: unknown;
}

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, nextCallHandler: CallHandler) {
    const skipPaths = ['/'];
    const url = context.switchToHttp().getRequest<Request>().url;
    const status = context.switchToHttp().getResponse<Response>().statusCode;
    if (skipPaths.includes(url)) return nextCallHandler.handle();

    return nextCallHandler.handle().pipe(
      map((res: ApiResponse) => {
        return {
          statusCode: status,
          timestamp: new Date().toISOString(),
          path: url,
          message: res?.message ?? 'success',
          data: res?.data ?? null,
          ...(res?.meta && { meta: res.meta }),
        };
      }),
    );
  }
}
