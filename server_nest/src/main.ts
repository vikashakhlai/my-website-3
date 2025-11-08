// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ErrorResponseDto } from './common/dto/error-response.dto';
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
      .addServer('https://api.yoursite.com', 'Production server')
      .addServer('https://staging-api.yoursite.com', 'Staging server')
      .addServer(
        `${appConfig.backendUrl}/${appConfig.apiPrefix}`,
        'Local development server',
      )
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'access-token',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config, {
      deepScanRoutes: true,
      extraModels: [ErrorResponseDto],
    });
    document.components = document.components ?? {};
    document.components.securitySchemes = {
      'access-token': {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'JWT токен доступа (access token). Передайте токен в заголовке Authorization в формате: "Bearer <token>". Токен можно получить через эндпоинт /auth/login. Некоторые эндпоинты являются публичными и не требуют токена, но могут возвращать дополнительные поля (например, userRating, isFavorite) если токен предоставлен.',
      },
    };
    // Регистрируем стандартизированные ответы об ошибках
    document.components.responses = {
      BadRequest: {
        description: 'Неверные данные запроса',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponseDto' },
            example: {
              statusCode: 400,
              message: 'Неверные данные запроса. Проверьте обязательные поля.',
              error: 'Bad Request',
            },
          },
        },
      },
      Unauthorized: {
        description: 'Требуется аутентификация',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponseDto' },
            example: {
              statusCode: 401,
              message: 'Требуется аутентификация',
              error: 'Unauthorized',
            },
          },
        },
      },
      Forbidden: {
        description: 'Недостаточно прав для выполнения операции',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponseDto' },
            example: {
              statusCode: 403,
              message: 'Недостаточно прав для выполнения операции',
              error: 'Forbidden',
            },
          },
        },
      },
      NotFound: {
        description: 'Запрашиваемый ресурс не найден',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponseDto' },
            example: {
              statusCode: 404,
              message: 'Ресурс не найден',
              error: 'Not Found',
            },
          },
        },
      },
      InternalServerError: {
        description: 'Внутренняя ошибка сервера',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponseDto' },
            example: {
              statusCode: 500,
              message: 'Внутренняя ошибка сервера',
              error: 'Internal Server Error',
            },
          },
        },
      },
    };

    // Функция для замены inline error responses на ссылки на переиспользуемые компоненты
    function replaceInlineErrorResponsesWithRefs(doc: any) {
      const statusToRef: Record<number, string> = {
        400: '#/components/responses/BadRequest',
        401: '#/components/responses/Unauthorized',
        403: '#/components/responses/Forbidden',
        404: '#/components/responses/NotFound',
        500: '#/components/responses/InternalServerError',
      };

      const defaultDescriptions: Record<number, string> = {
        400: 'Неверные данные запроса',
        401: 'Требуется аутентификация',
        403: 'Недостаточно прав для выполнения операции',
        404: 'Запрашиваемый ресурс не найден',
        500: 'Внутренняя ошибка сервера',
      };

      function processPaths(paths: any) {
        for (const pathKey in paths) {
          const pathItem = paths[pathKey];
          for (const method in pathItem) {
            if (
              ['get', 'post', 'put', 'patch', 'delete', 'options', 'head']
                .includes(method.toLowerCase())
            ) {
              const operation = pathItem[method];
              if (operation?.responses) {
                for (const statusCode in operation.responses) {
                  const statusNum = parseInt(statusCode);
                  if (statusToRef[statusNum]) {
                    const response = operation.responses[statusCode];
                    // Проверяем, что это inline response (не уже ссылка)
                    if (response && !response.$ref) {
                      // Сохраняем кастомное описание, если оно добавляет контекст
                      const customDescription = response.description;
                      const defaultDescription = defaultDescriptions[statusNum];
                      const hasCustomContext =
                        customDescription &&
                        customDescription !== defaultDescription &&
                        customDescription.trim().length > 0;

                      // Заменяем на ссылку, сохраняя кастомное описание если есть
                      if (hasCustomContext) {
                        operation.responses[statusCode] = {
                          $ref: statusToRef[statusNum],
                          description: customDescription,
                        };
                      } else {
                        operation.responses[statusCode] = {
                          $ref: statusToRef[statusNum],
                        };
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      if (doc.paths) {
        processPaths(doc.paths);
      }
    }

    // Заменяем все inline error responses на ссылки
    replaceInlineErrorResponsesWithRefs(document);

    // Удаляем глобальный security блок из корня OpenAPI документа
    // NestJS Swagger автоматически применяет security только к операциям с @ApiBearerAuth
    // Публичные операции (без @ApiBearerAuth) не должны иметь security блок
    function removeGlobalSecurity(doc: any) {
      // Удаляем глобальный security блок из корня документа, если он существует
      if (doc.security !== undefined) {
        delete doc.security;
      }
      
      // Также удаляем security из уровня paths (если он был установлен глобально)
      if (doc.paths) {
        for (const pathKey in doc.paths) {
          const pathItem = doc.paths[pathKey];
          if (pathItem.security !== undefined) {
            delete pathItem.security;
          }
        }
      }
    }

    // Удаляем глобальный security блок
    // Security будет применяться только к операциям с @ApiBearerAuth декоратором
    removeGlobalSecurity(document);

    // Не устанавливаем глобальный security - применяем только к защищенным эндпоинтам
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(appConfig.port, '0.0.0.0');
  console.log(
    `🚀 Server running on http://localhost:${appConfig.port}/${appConfig.apiPrefix}`,
  );
  console.log(`📝 Environment: ${appConfig.nodeEnv}`);
  console.log(`🌐 Frontend URL: ${appConfig.frontendUrl}`);
}
bootstrap();
