// src/auth/interfaces/auth-tokens.interface.ts
import { UserResponseDto } from 'src/user/dto/user-response.dto';

export interface AuthTokens {
  user: UserResponseDto;
  access_token: string;
  refresh_token: string;
}
