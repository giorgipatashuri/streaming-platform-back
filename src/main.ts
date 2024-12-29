import { NestFactory } from '@nestjs/core';
import { CoreModule } from './core/core.module';
import { ConfigService } from '@nestjs/config';
import * as cookie from 'cookie-parser';
import * as session from 'express-session';
import { RedisStore } from 'connect-redis';
import { ValidationPipe } from '@nestjs/common';
import { RedisService } from './core/redis/redis.service';
async function bootstrap() {
  const app = await NestFactory.create(CoreModule);

  const config = app.get(ConfigService);
  const redis = app.get(RedisService);

  app.use(cookie(config.getOrThrow<string>('COOKIE_SECRET')));

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: config.getOrThrow<string>('ALLOWED_ORIGINS'),
    credentials: true,
    exposedHeaders: ['set-cookie'],
  });

  app.use(
    session({
      secret: config.getOrThrow<string>('SESSION_SECRET'),
      name: config.getOrThrow<string>('SESSION_NAME'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        domain: config.getOrThrow<string>('SESSION_DOMAIN'),
        maxAge: config.getOrThrow<number>('SESSION_MAX_VALUE'),
        httpOnly: config.getOrThrow<boolean>('SESSION_HTTP_ONLY'),
        secure: config.getOrThrow<boolean>('SESSION_SECURE'),
        sameSite: 'lax',
      },
      store: new RedisStore({
        client: redis,
        prefix: config.getOrThrow<string>('SESSION_FOLDER'),
      }),
    }),
  );

  await app.listen(config.getOrThrow<number>('PORT') ?? 3000);
}
bootstrap();
