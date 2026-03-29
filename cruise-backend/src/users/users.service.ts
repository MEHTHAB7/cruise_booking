import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}
  findAll() { return this.repo.find({ select: ['id', 'email', 'firstName', 'lastName', 'role', 'createdAt'] }); }
  async findOne(id: string) {
    const u = await this.repo.findOne({ where: { id } });
    if (!u) throw new NotFoundException('User not found');
    return u;
  }
  async update(id: string, data: Partial<User>) {
    const { passwordHash, ...safe } = data as any;
    await this.repo.update(id, safe);
    return this.findOne(id);
  }
}
