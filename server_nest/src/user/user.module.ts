import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AccountController } from './account.controller';
import { FavoritesModule } from 'src/favorites/favorites.module';
import { RatingsModule } from 'src/ratings/ratings.module';
import { AccountService } from './account.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), FavoritesModule, RatingsModule],
  providers: [UserService, AccountService],
  controllers: [UserController, AccountController],
  exports: [UserService, AccountService],
})
export class UserModule {}
