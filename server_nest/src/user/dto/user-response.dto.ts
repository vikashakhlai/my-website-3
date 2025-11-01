// src/user/dto/user-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/auth/roles.enum';
import { AccessLevel } from '../user.entity';

export class UserResponseDto {
  @ApiProperty({ example: '4d3b90d5-47b6-4e3d-bd23-8f8b6f7a3b3b' })
  id!: string;

  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiProperty({ enum: Role, example: Role.USER })
  role!: Role;

  @ApiProperty({ example: false })
  isAuthor!: boolean;

  @ApiProperty({
    enum: AccessLevel,
    example: AccessLevel.BASIC,
    description: 'Уровень доступа к контенту',
  })
  accessLevel!: AccessLevel;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
