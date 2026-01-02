import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Response } from 'express';

@Catch(RpcException) // Catch all errors to handle the serialized RPC object
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // If the exception has a specific structure from your microservice
    // e.g., throw new RpcException({ statusCode: 404, message: 'Not Found' })
    const status =
      exception?.statusCode ||
      exception?.status ||
      HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception?.message || 'Internal server error';

    response.status(status).json({
      statusCode: status,
      message: message,
    });
  }
}
