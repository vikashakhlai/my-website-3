import * as Joi from 'joi';

/**
 * Схема валидации переменных окружения
 *
 * Используется для проверки всех необходимых переменных окружения
 * при старте приложения. Если какая-то переменная отсутствует или
 * имеет неверный формат, приложение не запустится с понятным сообщением об ошибке.
 *
 * @see https://joi.dev/api/ для документации по валидации
 */
export const envValidationSchema = Joi.object({
  // ======================
  // Общие настройки
  // ======================
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development')
    .description('Окружение выполнения приложения'),

  PORT: Joi.number()
    .integer()
    .min(1)
    .max(65535)
    .default(3001)
    .description('Порт, на котором будет запущен сервер'),

  FRONTEND_URL: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .required()
    .description('URL фронтенд приложения (для CORS и CSP)'),

  BACKEND_URL: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .optional()
    .description('URL бэкенд приложения (для генерации абсолютных URL)'),

  API_PREFIX: Joi.string()
    .default('api/v1')
    .description('Префикс для всех API эндпоинтов'),

  // ======================
  // База данных
  // ======================
  DB_HOST: Joi.string()
    .required()
    .description('Хост базы данных PostgreSQL'),

  DB_PORT: Joi.number()
    .integer()
    .min(1)
    .max(65535)
    .required()
    .description('Порт базы данных PostgreSQL'),

  DB_USER: Joi.string()
    .required()
    .description('Имя пользователя базы данных'),

  DB_PASSWORD: Joi.string()
    .required()
    .min(1)
    .description('Пароль базы данных'),

  DB_NAME: Joi.string()
    .required()
    .description('Название базы данных'),

  // ======================
  // JWT токены
  // ======================
  JWT_ACCESS_SECRET: Joi.string()
    .required()
    .min(32)
    .description('Секретный ключ для подписи access токенов (минимум 32 символа)'),

  JWT_ACCESS_EXPIRES_IN: Joi.string()
    .default('15m')
    .description('Время жизни access токена (например: 15m, 1h, 7d)'),

  JWT_REFRESH_SECRET: Joi.string()
    .required()
    .min(32)
    .description('Секретный ключ для подписи refresh токенов (минимум 32 символа)'),

  JWT_REFRESH_EXPIRES_IN: Joi.string()
    .default('7d')
    .description('Время жизни refresh токена (например: 15m, 1h, 7d)'),
})
  .unknown(false) // Запрещаем неизвестные переменные
  .messages({
    'any.required': '{{#label}} is required but was not provided',
    'string.uri': '{{#label}} must be a valid URI',
    'number.base': '{{#label}} must be a number',
    'number.min': '{{#label}} must be at least {{#limit}}',
    'number.max': '{{#label}} must be at most {{#limit}}',
    'string.min': '{{#label}} must be at least {{#limit}} characters long',
  });

