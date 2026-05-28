import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common'
import { Response } from 'express'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    // Prisma known request errors
    if (exception?.code === 'P2025') {
      return response.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Resource tidak ditemukan',
        error: 'Not Found',
      })
    }

    if (exception?.code === 'P2002') {
      return response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: 'Data sudah ada',
        error: 'Conflict',
      })
    }

    if (exception?.code === 'P2003') {
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Referensi data tidak valid',
        error: 'Bad Request',
      })
    }

    // NestJS HTTP exceptions (already have statusCode, message)
    if (exception?.getStatus && exception?.getResponse) {
      const status = exception.getStatus()
      const res = exception.getResponse()
      return response.status(status).json(typeof res === 'string' ? { statusCode: status, message: res } : res)
    }

    // Generic fallback
    const status = exception?.status || HttpStatus.INTERNAL_SERVER_ERROR
    return response.status(status).json({
      statusCode: status,
      message: exception?.message || 'Internal server error',
      error: status === HttpStatus.INTERNAL_SERVER_ERROR ? 'Internal Server Error' : undefined,
    })
  }
}
