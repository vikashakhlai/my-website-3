// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import databaseConfig from './config/database.config';
import { AllConfigType, DatabaseConfig } from './config/configuration.types';

// modules
import { AppController } from './app.controller';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { BookModule } from './books/books.module';
import { AuthorsModule } from './authors/authors.module';
import { TagsModule } from './tags/tags.module';
import { FavoritesModule } from './favorites/favorites.module';
import { TextbooksModule } from './textbooks/textbooks.module';
import { ArticlesModule } from './articles/articles.module';
import { DictionaryModule } from './dictionary/dictionary.module';
import { PersonalitiesModule } from './personalities/personalities.module';
import { QuotesModule } from './quotes/quotes.module';
import { SubtitlesModule } from './subtitles/subtitles.module';
import { MediaModule } from './media/media.module';
import { DialectsModule } from './dialect/dialects.module';
import { DialectTopicsModule } from './dialect_topics/dialect_topics.module';
import { DialogueModule } from './dialogue/dialogue.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CommentsModule } from './comments/comments.module';
import { RatingsModule } from './ratings/ratings.module';

import { ConfigService } from '@nestjs/config';
import { GlobalJwtAuthGuard } from './auth/guards/global-jwt.guard';

@Module({
  imports: [
    // ✅ .env config
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      envFilePath: ['.env'],
    }),

    // ✅ TypeORM
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AllConfigType>) => {
        const db = configService.getOrThrow<DatabaseConfig>('database');
        return {
          type: 'postgres',
          host: db.host,
          port: db.port,
          username: db.username,
          password: db.password,
          database: db.database,
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

    // ✅ Throttler (rate limit, глобально через APP_GUARD)
    ThrottlerModule.forRoot([
      {
        name: 'global',
        ttl: 60, // окно 60с
        limit: 100, // 100 запросов/мин на IP (подстрой при необходимости)
      },
    ]),

    // ✅ App modules
    UserModule,
    AuthModule,
    BookModule,
    AuthorsModule,
    TagsModule,
    FavoritesModule,
    TextbooksModule,
    ArticlesModule,
    DictionaryModule,
    PersonalitiesModule,
    MediaModule,
    QuotesModule,
    SubtitlesModule,
    DialectsModule,
    DialectTopicsModule,
    DialogueModule,
    NotificationsModule,
    CommentsModule,
    RatingsModule,
  ],
  controllers: [AppController],
  providers: [
    // ✅ Глобально: сначала JWT, сверху над ThrottlerGuard важен порядок
    { provide: APP_GUARD, useClass: GlobalJwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
