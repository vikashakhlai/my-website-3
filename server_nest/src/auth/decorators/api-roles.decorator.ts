import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Role } from '../roles.enum';

export const API_ROLES_KEY = 'api:roles';
export const ApiRoles = (...roles: Role[]) =>
  applyDecorators(
    SetMetadata(API_ROLES_KEY, roles),
    ApiOperation({ description: `🔐 Requires roles: ${roles.join(', ')}` }),
  );
