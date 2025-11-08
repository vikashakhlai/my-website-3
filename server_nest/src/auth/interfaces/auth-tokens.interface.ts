import { UserResponseDto } from 'src/user/dto/user-response.dto';

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  user: UserResponseDto;
}
