import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ship } from './entities/ship.entity';

@Injectable()
export class ShipsService {
  constructor(@InjectRepository(Ship) private repo: Repository<Ship>) {}
  findAll() { return this.repo.find(); }
  async findOne(id: string) {
    const ship = await this.repo.findOne({ where: { id } });
    if (!ship) throw new NotFoundException('Ship not found');
    return ship;
  }
  create(data: Partial<Ship>) { return this.repo.save(this.repo.create(data)); }
  async update(id: string, data: Partial<Ship>) {
    await this.findOne(id);
    await this.repo.update(id, data);
    return this.findOne(id);
  }
  async remove(id: string) { await this.findOne(id); return this.repo.delete(id); }
}
