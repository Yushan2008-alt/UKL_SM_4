import { NestFactory } from '@nestjs/core'
import { ValidationPipe, Logger } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import cookieParser from 'cookie-parser'
import { AppModule } from './app.module'
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter'

const logger = new Logger('Bootstrap')

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger })

  app.use(cookieParser())
  app.useGlobalFilters(new AllExceptionsFilter())

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }))

  const corsOrigin = process.env.CORS_ORIGIN || '*'
  app.enableCors({
    origin: corsOrigin === '*' ? true : corsOrigin.split(',').map(s => s.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
  logger.log(`CORS origin: ${corsOrigin}`)

  try {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('E-Commerce Pelajar API')
      .setDescription('REST API for Student Commerce')
      .setVersion('1.0')
      .addBearerAuth()
      .build()

    const document = SwaggerModule.createDocument(app, swaggerConfig)
    SwaggerModule.setup('api/docs', app, document)
    logger.log('Swagger docs available at /api/docs')
  } catch (err) {
    logger.warn(`Swagger setup skipped: ${(err as Error).message}`)
  }

  const port = process.env.PORT ?? 3001
  await app.listen(port, '0.0.0.0')
  logger.log(`Server running on port ${port}`)
}

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err)
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason)
})

bootstrap().catch((err) => {
  console.error('BOOTSTRAP FAILED:', err)
  process.exit(1)
})
