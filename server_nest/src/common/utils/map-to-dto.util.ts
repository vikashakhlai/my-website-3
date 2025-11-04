import { plainToInstance } from 'class-transformer';

export function mapToDto<T>(dto: new () => T, data: any): T {
  return plainToInstance(dto, data, {
    excludeExtraneousValues: true,
  });
}
