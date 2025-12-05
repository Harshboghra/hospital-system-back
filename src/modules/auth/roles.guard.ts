import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/common/decorators/roles.decorator';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // If route has @Public(), skip roles
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    // Get required roles for this route
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No roles -> allow
    }

    // Extract user from request (added by JWT strategy)
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userTypeId) {
      throw new ForbiddenException('No permission');
    }

    // Convert userTypeId → string
    const userRole = user.userTypeId;

    // Check if user role included
    if (!requiredRoles.includes(userRole)) {
      throw new ForbiddenException('Access denied');
    }

    return true;
  }
}
