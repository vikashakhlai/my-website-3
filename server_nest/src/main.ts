// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { join } from 'path';

import { videoStreamMiddleware } from './middlewares/video-stream.middleware';
import { subtitlesMiddleware } from './middlewares/subtitles.middleware';
import { HttpExceptionFilter } from './common/errors/http-exception.filter';
import { AllConfigType, AppConfig } from './config/configuration.types';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Получаем ConfigService из контекста приложения
  const configService = app.get(ConfigService<AllConfigType>);
  const appConfig = configService.getOrThrow<AppConfig>('app');

  // если есть nginx/ingress — важен для реального IP
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.use(cookieParser());

  const FRONTEND_URL = appConfig.frontendUrl;
  const corsOptions = {
    origin: [FRONTEND_URL],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Authorization',
      'Range',
      'Content-Type',
      'Origin',
      'Accept',
      'X-Requested-With',
    ],
    exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length'],
  };
  app.use(cors(corsOptions));
  app.enableCors(corsOptions);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
      referrerPolicy: { policy: 'no-referrer' },
      noSniff: true,
      frameguard: { action: 'deny' },
      hidePoweredBy: true,
      hsts:
        appConfig.nodeEnv === 'production'
          ? { maxAge: 60 * 60 * 24 * 180 } // 180 days
          : false,
      contentSecurityPolicy:
        appConfig.nodeEnv === 'production'
          ? {
              directives: {
                defaultSrc: ["'self'"],
                imgSrc: ["'self'", 'data:', 'blob:', FRONTEND_URL],
                mediaSrc: ["'self'", 'blob:', FRONTEND_URL],
                scriptSrc: ["'self'", FRONTEND_URL],
                styleSrc: ["'self'", "'unsafe-inline'", FRONTEND_URL],
                // Разрешаем SSE соединения
                connectSrc: ["'self'", FRONTEND_URL, 'blob:', 'data:'],
              },
            }
          : false,
      // Отключаем XSS фильтр для SSE (может мешать)
      xssFilter: true,
      // Разрешаем iframe для встраивания (если нужно)
      frameguard: { action: 'deny' },
    }),
  );

  const uploadsPath = join(__dirname, '..', 'uploads');
  app.use('/uploads/dialect/:dialect/subtitles/:filename', subtitlesMiddleware);
  app.use('/uploads/:dialect/videos/:filename', videoStreamMiddleware);
  app.use('/uploads', express.static(uploadsPath));

  app.setGlobalPrefix(appConfig.apiPrefix);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidUnknownValues: true,
      validationError: { target: false, value: false },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  if (appConfig.nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Backend API')
      .setDescription('Protected API with global JWT')
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'access-token',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config, {
      deepScanRoutes: true,
    });
    document.components = document.components ?? {};
    document.components.securitySchemes = {
      'access-token': { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    };
    document.security = [{ 'access-token': [] }];
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(appConfig.port, '0.0.0.0');
  console.log(`🚀 Server running on http://localhost:${appConfig.port}/${appConfig.apiPrefix}`);
  console.log(`📝 Environment: ${appConfig.nodeEnv}`);
  console.log(`🌐 Frontend URL: ${appConfig.frontendUrl}`);
}
bootstrap();
