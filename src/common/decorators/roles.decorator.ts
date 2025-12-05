import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Number[]) => SetMetadata(ROLES_KEY, roles);
