import { Module, Global } from '@nestjs/common';
import { DatabaseService } from './database.service';

/**
 * Глобальный модуль для работы с базой данных
 *
 * Предоставляет DatabaseService для прямого доступа к PostgreSQL через пул соединений.
 * Модуль помечен как @Global(), поэтому DatabaseService доступен во всех модулях
 * без необходимости импортировать DatabaseModule.
 *
 * @example
 * ```typescript
 * @Module({
 *   providers: [SomeService],
 * })
 * export class SomeModule {
 *   constructor(private db: DatabaseService) {} // Доступен автоматически
 * }
 * ```
 */
@Global()
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
