import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import ConfigProvider from './config/ConfigProvider';
// Using require for Fastify plugins due to TypeScript compatibility issues
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fastifyCookie = require('@fastify/cookie');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fastifyHelmet = require('@fastify/helmet');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fastifyMultipart = require('@fastify/multipart');

const PORT = 3001;

async function bootstrap() {
  // Validate environment variables before starting the application
  ConfigProvider.validateEnvironment();
  
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
 
  // Cookie support for sessions
  await app.register(fastifyCookie, {
    secret: ConfigProvider.getCookieSecret(),
  });

  // Security headers
  await app.register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "ws:", "wss:"],
      },
    },
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // Body size limit
  await app.register(fastifyMultipart, {
    limits: {
      fileSize: 1024 * 1024, // 1MB
    },
  });

  if (!ConfigProvider.isProduction()) {
    app.enableCors({ credentials: true });
  }

  await app.listen(PORT, '0.0.0.0');
}

bootstrap();
