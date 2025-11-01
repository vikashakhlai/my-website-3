import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import cors from 'cors';
import { join } from 'path';

import { videoStreamMiddleware } from './middlewares/video-stream.middleware';
import { subtitlesMiddleware } from './middlewares/subtitles.middleware';
import { GlobalJwtAuthGuard } from './auth/guards/global-jwt.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ CORS
  const corsOptions = {
    origin: [process.env.FRONTEND_URL || 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Authorization',
      'Range',
      'Content-Type',
      'Origin',
      'Accept',
    ],
    exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length'],
  };
  app.use(cors(corsOptions));
  app.enableCors(corsOptions);

  // ✅ Static uploads
  const uploadsPath = join(__dirname, '..', 'uploads');
  app.use('/uploads/dialect/:dialect/subtitles/:filename', subtitlesMiddleware);
  app.use('/uploads/:dialect/videos/:filename', videoStreamMiddleware);
  app.use('/uploads', express.static(uploadsPath));

  // ✅ Prefix /api/v1
  app.setGlobalPrefix('api/v1');

  // ✅ Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ✅ Global JWT Guard (всё требует токен, кроме @Public())
  app.useGlobalGuards(new GlobalJwtAuthGuard(app.get(Reflector)));

  // ✅ Swagger only in dev
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Backend API')
      .setDescription('Protected API with global JWT')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Введите JWT access token',
        },
        'access-token',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config, {
      deepScanRoutes: true,
    });

    // ✅ Глобально требуем токен для всех эндпоинтов, кроме @Public()
    document.components = document.components ?? {};
    document.components.securitySchemes = {
      'access-token': {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    };
    document.security = [{ 'access-token': [] }];

    SwaggerModule.setup('api/docs', app, document);

    app.getHttpAdapter().get('/api-json', (req, res) => res.json(document));
  }

  const port = process.env.PORT ?? 3001;
  await app.listen(port);

  console.log(`🚀 Server running at http://localhost:${port}/api/v1`);
  console.log(`📁 Static files: http://localhost:${port}/uploads/...`);
  console.log(`📘 Swagger: http://localhost:${port}/api/docs`);
}

bootstrap();
