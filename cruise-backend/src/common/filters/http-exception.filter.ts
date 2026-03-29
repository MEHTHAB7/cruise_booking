import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // ✅ SPECIAL HANDLING FOR CSRF ERRORS (CSURF throws raw errors)
    if (exception.code === 'EBADCSRFTOKEN') {
      status = HttpStatus.FORBIDDEN;
      message = 'Invalid or missing CSRF token';
    }

    if (response.headersSent) {
      console.error('Err HTTP HEADERS SENT guard triggered:', exception);
      return;
    }

    // ✅ Log the actual error for debugging 500s
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      console.error('[SERVER ERROR]:', exception);
    } else {
      console.warn(`[API ERROR] ${status}:`, exception.message || exception);
    }

    response.status(status).json({
      statusCode: status,
      message,
    });
  }
}