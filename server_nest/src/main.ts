import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // 💡 В продакшене полезно включить CORS и disable logs при нужде
    cors: {
      origin: [
        process.env.FRONTEND_URL || 'http://localhost:5173', // Vite dev
      ],
      credentials: true,
    },
  });

  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  // ✅ Глобальный префикс API
  app.setGlobalPrefix('api/v1');

  // ✅ Валидация DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // удаляет лишние поля из body
      forbidNonWhitelisted: true, // выбрасывает ошибку при неизвестных полях
      transform: true, // автоматически конвертирует типы
    }),
  );

  // ✅ Swagger — только если не production
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
          name: 'JWT',
          description: 'Введите JWT токен',
          in: 'header',
        },
        'access-token',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    console.log(
      '📘 Swagger UI доступен по адресу: http://localhost:3001/api/docs',
    );
  }

  const port = process.env.PORT ?? 3001;
  await app.listen(port);

  console.log(`🚀 Сервер запущен на http://localhost:${port}/api/v1`);
}

bootstrap();
