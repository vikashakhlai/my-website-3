import { ApiProperty } from '@nestjs/swagger';
import { UserRole, AccessLevel } from '../user/user.entity';

export class UserResponseDto {
  @ApiProperty({ example: 'b1a3e4d6-1234-4567-89ab-123456789abc' })
  id!: string;

  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.USER })
  role!: UserRole;

  @ApiProperty({ enum: AccessLevel, example: AccessLevel.BASIC })
  accessLevel!: AccessLevel;

  @ApiProperty({ example: false })
  isAuthor!: boolean;

  @ApiProperty({ example: '2025-10-16T12:34:56.789Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2025-10-16T12:34:56.789Z' })
  updatedAt!: Date;
}
