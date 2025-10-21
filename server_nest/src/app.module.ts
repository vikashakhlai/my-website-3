import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import databaseConfig from './config/database.config';
import { AllConfigType, DatabaseConfig } from './config/configuration.types';
import { BookModule } from './books/books.module';
import { AuthorsModule } from './authors/authors.module';
import { TagsModule } from './tags/tags.module';
import { FavoritesModule } from './favorites/favorites.module';
import { TextbooksModule } from './textbooks/textbooks.module';
import { ArticlesModule } from './articles/articles.module';
import { VideosModule } from './videos/videos.module';
import { DictionaryModule } from './dictionary/dictionary.module';
import { PersonalitiesModule } from './personalities/personalities.module';
import { QuotesModule } from './quotes/quotes.module';

@Module({
  imports: [
    // ✅ Глобальная конфигурация (.env + кастомные конфиги)
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      envFilePath: ['.env'],
    }),

    // ✅ Подключение к PostgreSQL через TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AllConfigType>) => {
        const dbConfig = configService.getOrThrow<DatabaseConfig>('database');
        return {
          type: 'postgres' as const,
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.database,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: false,
          logging: process.env.NODE_ENV === 'development',
          ssl:
            process.env.NODE_ENV === 'production'
              ? { rejectUnauthorized: false }
              : false,
        };
      },
    }),

    // ✅ Модули приложения
    UserModule,
    AuthModule,
    BookModule,
    AuthorsModule,
    TagsModule,
    FavoritesModule,
    TextbooksModule,
    ArticlesModule,
    VideosModule,
    DictionaryModule,
    PersonalitiesModule,
    QuotesModule,
  ],

  controllers: [AppController],
})
export class AppModule {}
