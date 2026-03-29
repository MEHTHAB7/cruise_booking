import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const session = request.session;

    if (!session?.userId) {
      throw new UnauthorizedException('Please log in');
    }

    // 🔐 Session timeout (30 mins)
    const now = Date.now();
    const lastActivity = session.lastActivity || 0;

    if (now - lastActivity > 30 * 60 * 1000) {
      throw new UnauthorizedException('Session expired');
    }

    // 🔐 IP check
    if (session.ip && session.ip !== request.ip) {
      throw new UnauthorizedException('Session IP mismatch');
    }

    // 🔐 User-Agent check
    if (session.userAgent && session.userAgent !== request.headers['user-agent']) {
      throw new UnauthorizedException('Session device mismatch');
    }

    // Update activity
    session.lastActivity = now;

    return true;
  }
}