// src/auth/interfaces/jwt-payload.interface.ts
import { UserRole } from '../../user/user.entity';

export interface JwtPayload {
  sub: string;
  role: UserRole;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}
