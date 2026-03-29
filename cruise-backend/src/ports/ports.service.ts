import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Port } from './entities/port.entity';
@Injectable()
export class PortsService {
  constructor(@InjectRepository(Port) private repo: Repository<Port>) {}
  findAll() { return this.repo.find(); }
  async findOne(id: string) {
    const p = await this.repo.findOne({ where: { id } });
    if (!p) throw new NotFoundException('Port not found');
    return p;
  }
  create(data: Partial<Port>) { return this.repo.save(this.repo.create(data)); }
  async update(id: string, data: Partial<Port>) { await this.repo.update(id, data); return this.findOne(id); }
  async remove(id: string) { return this.repo.delete(id); }
}
