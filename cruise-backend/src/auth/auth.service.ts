import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User, UserRole } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // =========================
  // REGISTER
  // =========================
  async register(dto: RegisterDto): Promise<Omit<User, 'passwordHash'>> {
    if (!dto.privacyAccepted) {
      throw new BadRequestException('You must accept the privacy policy to register');
    }

    const email = dto.email.trim().toLowerCase();
    const existing = await this.userRepo.findOne({
      where: { email },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hash = await bcrypt.hash(dto.password, 12);

    const user = this.userRepo.create({
      email,
      passwordHash: hash,
      firstName: dto.firstName,
      lastName: dto.lastName,

      // ✅ SAFE NULL HANDLING
      phone: dto.phone ?? null,
      dob: dto.dob ? new Date(dto.dob) : null,

      marketingConsent: dto.marketingConsent ?? false,
      privacyAccepted: true,

      role: UserRole.GUEST,
    });

    const saved = await this.userRepo.save(user);

    this.logger.log(`[AUTH] New user registered: ${saved.email}`);

    const { passwordHash, ...result } = saved;
    return result as Omit<User, 'passwordHash'>;
  }

  // =========================
  // LOGIN VALIDATION
  // =========================
  async validateUser(dto: LoginDto): Promise<User> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.userRepo.findOne({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      this.logger.warn(`[AUTH] Login Failed: User prefix "${email.substring(0, 3)}" not found or no hash`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!valid) {
      this.logger.warn(`[AUTH] Login Failed: Wrong password for "${email}". Input Pwd Len: ${dto.password?.length}. Hash prefix: ${user.passwordHash.substring(0, 10)}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.log(`[AUTH] User logged in: ${user.email}`);

    return user;
  }

  // =========================
  // FIND USER
  // =========================
  async findById(id: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { id },
    });
  }
}