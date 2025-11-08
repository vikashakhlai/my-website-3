import { plainToInstance, ClassConstructor } from 'class-transformer';

/**
 * Безопасное преобразование данных в DTO
 * 
 * Преобразует обычные объекты в экземпляры DTO классов с использованием
 * class-transformer. Автоматически исключает лишние поля, которые не
 * помечены декоратором @Expose().
 * 
 * @param dto - Класс DTO для преобразования
 * @param data - Данные для преобразования
 * @returns Экземпляр DTO
 * 
 * @example
 * ```typescript
 * const userDto = mapToDto(UserResponseDto, userEntity);
 * ```
 */
export function mapToDto<T>(
  dto: ClassConstructor<T>,
  data: any,
): T {
  if (!data) {
    return data;
  }

  return plainToInstance(dto, data, {
    excludeExtraneousValues: true,
    enableImplicitConversion: true,
  });
}

/**
 * Безопасное преобразование массива данных в массив DTO
 * 
 * Преобразует массив обычных объектов в массив экземпляров DTO классов.
 * 
 * @param dto - Класс DTO для преобразования
 * @param data - Массив данных для преобразования
 * @returns Массив экземпляров DTO
 * 
 * @example
 * ```typescript
 * const usersDto = mapToDtoArray(UserResponseDto, [user1, user2]);
 * ```
 */
export function mapToDtoArray<T>(
  dto: ClassConstructor<T>,
  data: any[],
): T[] {
  if (!data || !Array.isArray(data)) {
    return [];
  }

  return data.map((item) =>
    plainToInstance(dto, item, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    }),
  );
}
