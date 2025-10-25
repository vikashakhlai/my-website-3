import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import cors from 'cors';
import { join } from 'path';
import { videoStreamMiddleware } from './middlewares/video-stream.middleware';
import { subtitlesMiddleware } from './middlewares/subtitles.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Настройки CORS
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

  // ✅ Подключаем CORS до всего остального
  app.use(cors(corsOptions));
  app.enableCors(corsOptions);

  // ✅ Путь к папке с загрузками
  const uploadsPath = join(__dirname, '..', 'uploads');

  // ✅ Сначала обычная статика (для изображений, pdf и т.п.)
  app.use('/uploads', express.static(uploadsPath));

  // ✅ Потом кастомные middleware для потокового видео и субтитров
  app.use('/uploads/:dialect/videos/:filename', videoStreamMiddleware);
  app.use('/uploads/:dialect/subtitles/:filename', subtitlesMiddleware);

  // ✅ Префикс API
  app.setGlobalPrefix('api/v1');

  // ✅ Глобальная валидация
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ✅ Swagger (dev)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('User Management API')
      .setDescription('API для управления пользователями и ролями')
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
