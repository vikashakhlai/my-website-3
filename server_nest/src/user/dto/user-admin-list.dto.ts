import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/auth/roles.enum';
import { AccessLevel } from '../user.entity';

export class UserAdminListDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ enum: Role })
  role!: Role;

  @ApiProperty()
  isAuthor!: boolean;

  @ApiProperty({ enum: AccessLevel })
  accessLevel!: AccessLevel;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
