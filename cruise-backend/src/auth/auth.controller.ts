import {
  Controller,
  Post,
  Body,
  Req,
  Get,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) {}

  // =========================
  // ✅ CSRF TOKEN ENDPOINT
  // =========================
  @Get('csrf-token')
  getCsrfToken(@Req() req: Request) {
    return {
      csrfToken: (req as any).csrfToken(),
    };
  }

  // =========================
  // LOGIN
  // =========================
  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const user = await this.authService.validateUser(dto);

    (req.session as any).userId = user.id;
    (req.session as any).userRole = user.role;
    (req.session as any).userEmail = user.email;
    (req.session as any).user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    (req.session as any).lastActivity = Date.now();
    (req.session as any).ip = req.ip;
    (req.session as any).userAgent = req.headers['user-agent'];

    // ✅ FORCE SAVE SESSION before responding to prevent race conditions
    await new Promise<void>((resolve, reject) => {
      req.session.save((err) => {
        if (err) {
          this.logger.error('[AUTH] Session save error:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });

    this.logger.log(`[AUTH] Session saved for: ${user.email}`);

    return {
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  // =========================
  // REGISTER
  // =========================
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.register(dto);

    return {
      message: 'Registration successful',
      user,
    };
  }

  // =========================
  // LOGOUT
  // =========================
  @Post('logout')
  logout(@Req() req: Request) {
    req.session.destroy(() => {});
    return { message: 'Logged out' };
  }

  // =========================
  // CURRENT USER
  // =========================
  @Get('me')
  me(@Req() req: Request) {
    return (req.session as any).user || null;
  }
}