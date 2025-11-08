import { ApiProperty } from '@nestjs/swagger';

/**
 * Стандартизированный DTO для ответов об ошибках
 *
 * Используется для всех ошибок API, обеспечивая единообразный формат ответов.
 * Соответствует стандарту HTTP и может быть использован для всех статусных кодов ошибок.
 *
 * @example
 * {
 *   "statusCode": 400,
 *   "message": "Неверные данные запроса. Проверьте обязательные поля.",
 *   "error": "Bad Request"
 * }
 *
 * @example
 * {
 *   "statusCode": 404,
 *   "message": "Книга с ID 123 не найдена",
 *   "error": "Not Found"
 * }
 */
export class ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP статусный код ошибки',
    example: 400,
    type: Number,
    minimum: 400,
    maximum: 599,
  })
  statusCode!: number;

  @ApiProperty({
    description: 'Сообщение об ошибке, описывающее проблему',
    example: 'Неверные данные запроса. Проверьте обязательные поля.',
    type: String,
  })
  message!: string | string[];

  @ApiProperty({
    description: 'Тип ошибки (стандартное название HTTP статуса)',
    example: 'Bad Request',
    type: String,
    enum: [
      'Bad Request',
      'Unauthorized',
      'Forbidden',
      'Not Found',
      'Internal Server Error',
      'Conflict',
      'Unprocessable Entity',
    ],
  })
  error!: string;
}

