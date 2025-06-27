import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

const PORT = 3001;

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  
  // Cookie support for sessions
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  await app.register(require('@fastify/cookie'), {
    secret: process.env.COOKIE_SECRET || 'p2piano-cookie-secret-change-in-production',
  });

  // Security headers
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  await app.register(require('@fastify/helmet'), {
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
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  app.register(require('@fastify/multipart'), {
    limits: {
      fileSize: 1024 * 1024, // 1MB
    },
  });

  if (process.env.NODE_ENV !== 'production') {
    app.enableCors();
  } else {
    app.enableCors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || false,
      credentials: true,
    });
  }

  await app.listen(PORT, '0.0.0.0');
}

bootstrap();
