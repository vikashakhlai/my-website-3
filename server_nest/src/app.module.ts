// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AllConfigType, DatabaseConfig } from './config/configuration.types';
import databaseConfig from './config/database.config';

// modules
import { AppController } from './app.controller';
import { ArticlesModule } from './articles/articles.module';
import { AuthModule } from './auth/auth.module';
import { AuthorsModule } from './authors/authors.module';
import { BookModule } from './books/books.module';
import { CommentsModule } from './comments/comments.module';
import { DialectsModule } from './dialect/dialects.module';
import { DialectTopicsModule } from './dialect_topics/dialect_topics.module';
import { DialogueModule } from './dialogue/dialogue.module';
import { DictionaryModule } from './dictionary/dictionary.module';
import { FavoritesModule } from './favorites/favorites.module';
import { MediaModule } from './media/media.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PersonalitiesModule } from './personalities/personalities.module';
import { QuotesModule } from './quotes/quotes.module';
import { RatingsModule } from './ratings/ratings.module';
import { SubtitlesModule } from './subtitles/subtitles.module';
import { TagsModule } from './tags/tags.module';
import { TextbooksModule } from './textbooks/textbooks.module';
import { UserModule } from './user/user.module';

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
          // synchronize: true,
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
