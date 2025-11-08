import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from '../dto/error-response.dto';

/**
 * Декоратор для применения стандартизированных ответов об ошибках к эндпоинтам
 *
 * Применяет общие ответы об ошибках (400, 401, 403, 404, 500) к эндпоинту.
 * Эти inline responses будут автоматически заменены на ссылки на переиспользуемые
 * компоненты из components.responses в post-processing в main.ts.
 *
 * @param options - Опции для настройки ответов об ошибках
 * @param options.include400 - Включить ответ 400 Bad Request (по умолчанию: true)
 * @param options.include401 - Включить ответ 401 Unauthorized (по умолчанию: true)
 * @param options.include403 - Включить ответ 403 Forbidden (по умолчанию: true)
 * @param options.include404 - Включить ответ 404 Not Found (по умолчанию: true)
 * @param options.include500 - Включить ответ 500 Internal Server Error (по умолчанию: true)
 *
 * @example
 * ```typescript
 * @ApiErrorResponses()
 * @Post()
 * async create(@Body() dto: CreateBookDto) {
 *   // ...
 * }
 * ```
 *
 * @example
 * ```typescript
 * @ApiErrorResponses({ include401: false, include403: false })
 * @Get()
 * async findAll() {
 *   // ...
 * }
 * ```
 */
export function ApiErrorResponses(options?: {
  include400?: boolean;
  include401?: boolean;
  include403?: boolean;
  include404?: boolean;
  include500?: boolean;
}) {
  const {
    include400 = true,
    include401 = true,
    include403 = true,
    include404 = true,
    include500 = true,
  } = options || {};

  const decorators: Array<ClassDecorator & MethodDecorator> = [];

  // Генерируем inline responses, которые будут заменены на $ref в post-processing
  if (include400) {
    decorators.push(
      ApiResponse({
        status: 400,
        description: 'Неверные данные запроса',
        type: ErrorResponseDto,
      }),
    );
  }

  if (include401) {
    decorators.push(
      ApiResponse({
        status: 401,
        description: 'Требуется аутентификация',
        type: ErrorResponseDto,
      }),
    );
  }

  if (include403) {
    decorators.push(
      ApiResponse({
        status: 403,
        description: 'Недостаточно прав для выполнения операции',
        type: ErrorResponseDto,
      }),
    );
  }

  if (include404) {
    decorators.push(
      ApiResponse({
        status: 404,
        description: 'Запрашиваемый ресурс не найден',
        type: ErrorResponseDto,
      }),
    );
  }

  if (include500) {
    decorators.push(
      ApiResponse({
        status: 500,
        description: 'Внутренняя ошибка сервера',
        type: ErrorResponseDto,
      }),
    );
  }

  return applyDecorators(...decorators);
}
