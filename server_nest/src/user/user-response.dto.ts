import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/auth/roles.enum';

export class UserResponseDto {
  @ApiProperty({ example: 'b1a3e4d6-1234-4567-89ab-123456789abc' })
  id!: string;

  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiProperty({ enum: Role, example: Role.USER })
  role!: Role;

  @ApiProperty({ example: false })
  isAuthor!: boolean;

  @ApiProperty({ example: '2025-10-16T12:34:56.789Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2025-10-16T12:34:56.789Z' })
  updatedAt!: Date;
}
