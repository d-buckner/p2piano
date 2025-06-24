import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

const PORT = 3001;

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  if (process.env.NODE_ENV !== 'production') {
    app.enableCors();
  }

  await app.listen(PORT, '0.0.0.0');
}

bootstrap();
