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
  JWT_SECRET: Joi.string()
    .optional()
    .custom((value, helpers) => {
      if (value) {
        const nodeEnv = process.env.NODE_ENV || 'development';
        const minLength = nodeEnv === 'production' ? 32 : 16;
        if (value.length < minLength) {
          return helpers.error('string.min', {
            limit: minLength,
            context: { label: 'JWT_SECRET', nodeEnv },
          });
        }
      }
      return value;
    })
    .description('Устаревший: единый секретный ключ для JWT (используется как fallback, если JWT_ACCESS_SECRET и JWT_REFRESH_SECRET не заданы)'),

  JWT_ACCESS_SECRET: Joi.string()
    .optional()
    .custom((value, helpers) => {
      if (value) {
        const nodeEnv = process.env.NODE_ENV || 'development';
        const minLength = nodeEnv === 'production' ? 32 : 16;
        if (value.length < minLength) {
          return helpers.error('string.min', {
            limit: minLength,
            context: { label: 'JWT_ACCESS_SECRET', nodeEnv },
          });
        }
      }
      return value;
    })
    .description('Секретный ключ для подписи access токенов (минимум 32 символа в production, 16 в development)'),

  JWT_EXPIRES_IN: Joi.string()
    .optional()
    .description('Устаревший: время жизни JWT токена (используется как fallback для JWT_ACCESS_EXPIRES_IN)'),

  JWT_ACCESS_TTL: Joi.string()
    .optional()
    .description('Устаревший: время жизни access токена (используется как fallback для JWT_ACCESS_EXPIRES_IN)'),

  JWT_ACCESS_EXPIRES_IN: Joi.string()
    .optional()
    .default('15m')
    .description('Время жизни access токена (например: 15m, 1h, 7d)'),

  JWT_REFRESH_SECRET: Joi.string()
    .optional()
    .custom((value, helpers) => {
      if (value) {
        const nodeEnv = process.env.NODE_ENV || 'development';
        const minLength = nodeEnv === 'production' ? 32 : 16;
        if (value.length < minLength) {
          return helpers.error('string.min', {
            limit: minLength,
            context: { label: 'JWT_REFRESH_SECRET', nodeEnv },
          });
        }
      }
      return value;
    })
    .description('Секретный ключ для подписи refresh токенов (минимум 32 символа в production, 16 в development)'),

  JWT_REFRESH_TTL: Joi.string()
    .optional()
    .description('Устаревший: время жизни refresh токена (используется как fallback для JWT_REFRESH_EXPIRES_IN)'),

  JWT_REFRESH_EXPIRES_IN: Joi.string()
    .optional()
    .default('7d')
    .description('Время жизни refresh токена (например: 15m, 1h, 7d)'),
})
  .unknown(true) // Разрешаем системные переменные окружения (Windows, Linux, etc.)
  .custom((value, helpers) => {
    // Проверяем, что хотя бы JWT_SECRET или оба JWT_ACCESS_SECRET и JWT_REFRESH_SECRET заданы
    const jwtSecret = value.JWT_SECRET;
    const accessSecret = value.JWT_ACCESS_SECRET;
    const refreshSecret = value.JWT_REFRESH_SECRET;

    if (!jwtSecret && (!accessSecret || !refreshSecret)) {
      return helpers.error('custom.jwt.secrets', {
        message: 'Either JWT_SECRET or both JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be provided',
      });
    }
    return value;
  })
  .messages({
    'any.required': '{{#label}} is required but was not provided',
    'string.uri': '{{#label}} must be a valid URI',
    'number.base': '{{#label}} must be a number',
    'number.min': '{{#label}} must be at least {{#limit}}',
    'number.max': '{{#label}} must be at most {{#limit}}',
    'string.min': '{{#label}} must be at least {{#limit}} characters long',
    'custom.jwt.secrets': 'Either JWT_SECRET or both JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be provided',
  });

