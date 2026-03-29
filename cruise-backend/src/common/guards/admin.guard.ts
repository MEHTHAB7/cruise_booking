import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // 🔐 Check authentication
    if (!request.session?.userId) {
      throw new UnauthorizedException('Please log in');
    }

    // 🔐 Check admin role
    if (request.session.userRole !== 'admin') {
      throw new ForbiddenException('Admin access only');
    }

    return true;
  }
}