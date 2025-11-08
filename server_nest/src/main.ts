import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import * as express from 'express';
import helmet from 'helmet';
import { join } from 'path';
import { AppModule } from './app.module';

import { HttpExceptionFilter } from './common/errors/http-exception.filter';
import { subtitlesMiddleware } from './middlewares/subtitles.middleware';
import { videoStreamMiddleware } from './middlewares/video-stream.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // если есть nginx/ingress — важен для реального IP
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.use(cookieParser());

  const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173';
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
        process.env.NODE_ENV === 'production'
          ? {
              maxAge: 60 * 60 * 24 * 180,
              includeSubDomains: true,
              preload: true,
            }
          : false,
      contentSecurityPolicy:
        process.env.NODE_ENV === 'production'
          ? {
              directives: {
                defaultSrc: ["'self'"],
                imgSrc: ["'self'", 'data:', 'blob:', FRONTEND_URL],
                mediaSrc: ["'self'", 'blob:', FRONTEND_URL],
                scriptSrc: ["'self'", FRONTEND_URL],
                styleSrc: ["'self'", "'unsafe-inline'", FRONTEND_URL],
                connectSrc: ["'self'", FRONTEND_URL],
              },
            }
          : false,
    }),
  );

  const uploadsPath = join(__dirname, '..', 'uploads');
  app.use('/uploads/dialect/:dialect/subtitles/:filename', subtitlesMiddleware);
  app.use('/uploads/:dialect/videos/:filename', videoStreamMiddleware);
  app.use('/uploads', express.static(uploadsPath));

  app.setGlobalPrefix('api/v1');

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

  if (process.env.NODE_ENV !== 'production') {
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

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 http://localhost:${port}/api/v1`);
}
bootstrap();
