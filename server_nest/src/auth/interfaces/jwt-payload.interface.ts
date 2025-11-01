// src/auth/interfaces/jwt-payload.interface.ts
import { Role } from '../roles.enum';

export interface JwtPayload {
  sub: string; // user.id
  role: Role; // SUPER_ADMIN | ADMIN | USER
}
