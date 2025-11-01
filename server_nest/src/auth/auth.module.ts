import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { UserModule } from '../user/user.module';

import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

import { jwtConstants } from './constants';

@Module({
  imports: [
    UserModule,

    // ✅ Passport с jwt по умолчанию
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // ✅ Глобальный JWT модуль
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: jwtConstants.expiresIn as any },
    }),
  ],

  providers: [
    AuthService,
    LocalStrategy, // для /login по логину/паролю
    JwtStrategy, // для всех защищённых маршрутов
  ],

  controllers: [AuthController],

  // ✅ Экспортируем чтобы другие модули могли использовать JWT и AuthService
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
