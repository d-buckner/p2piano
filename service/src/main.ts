// Initialize OpenTelemetry first, before any other imports
import './instrument';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SessionIoAdapter } from './adapters/session-io.adapter';
import { AppModule } from './app.module';
import ConfigProvider from './config/ConfigProvider';
import { shutdownOtelemetry } from './telemetry/otel';
import { OtelLogger } from './telemetry/otel-logger';
import { StructuredLogger } from './telemetry/structured-logger';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';


async function bootstrap() {
  // Validate environment variables before starting the application
  ConfigProvider.validateEnvironment();
  
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule, 
    new FastifyAdapter(),
  );

  // Set the global logger for all Logger instances
  app.useLogger(ConfigProvider.isOtelEnabled() ? new OtelLogger() : new StructuredLogger());
 
  // Use custom WebSocket adapter for session validation and Redis clustering
  const sessionAdapter = new SessionIoAdapter(app);
  app.useWebSocketAdapter(sessionAdapter);

  // Cookie support for sessions
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  await app.register(require('@fastify/cookie'), {
    secret: ConfigProvider.getCookieSecret(),
  });

  // Security headers
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  await app.register(require('@fastify/helmet'), {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'ws:', 'wss:'],
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


  if (!ConfigProvider.isProduction()) {
    app.enableCors({ 
      credentials: true,
      origin: 'http://localhost:5173'
    });
  }

  // Set up Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('p2piano API')
    .setDescription('Real-time collaborative piano platform API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'Session',
        description: 'Enter your session ID',
      },
      'session',
    )
    .addCookieAuth('sessionId', {
      type: 'apiKey',
      in: 'cookie',
      name: 'sessionId',
      description: 'Session ID stored in cookie',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = ConfigProvider.getPort();
  await app.listen(port, '0.0.0.0');
  console.log(`p2piano service listening on port ${port}`);
  console.log(`api documentation available at http://localhost:${port}/api`);
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await shutdownOtelemetry();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await shutdownOtelemetry();
  process.exit(0);
});

bootstrap();
