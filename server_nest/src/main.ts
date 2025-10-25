import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';
import { videoStreamMiddleware } from './middlewares/video-stream.middleware';
import { subtitlesMiddleware } from './middlewares/subtitles.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: [process.env.FRONTEND_URL || 'http://localhost:5173'],
      credentials: true,
    },
  });

  // ✅ Раздаём все файлы (jpg, png, webp и т.п.)
  // ✅ Раздача статических файлов (uploads)
  const uploadsPath = join(__dirname, '..', 'uploads');
  console.log('🗂  Serving static files from:', uploadsPath);
  app.use('/uploads', express.static(uploadsPath));

  // ✅ Middleware для видео и субтитров
  app.use('/uploads/:dialect/videos/:filename', videoStreamMiddleware);
  app.use('/uploads/:dialect/subtitles/:filename', subtitlesMiddleware);

  // ✅ Префикс API
  app.setGlobalPrefix('api/v1');

  // ✅ Валидация DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ✅ Swagger (только dev)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('User Management API')
      .setDescription('API для управления пользователями, ролями и авторами')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          in: 'header',
          name: 'JWT',
          description: 'Введите JWT токен',
        },
        'access-token',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 Сервер запущен на http://localhost:${port}/api/v1`);
  console.log(`📁 Статические файлы: http://localhost:${port}/uploads/...`);
}
bootstrap();
