import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CasinoEvent } from './entities/casino-event.entity';
@Injectable()
export class CasinoEventsService {
  constructor(@InjectRepository(CasinoEvent) private repo: Repository<CasinoEvent>) {}
  findByCruise(cruiseId: string, date?: string) {
    const qb = this.repo.createQueryBuilder('ce')
      .leftJoinAndSelect('ce.cruise', 'c')
      .where('c.id = :cruiseId', { cruiseId });
    if (date) qb.andWhere('ce.event_date = :date', { date });
    return qb.orderBy('ce.event_date', 'ASC').addOrderBy('ce.start_time', 'ASC').getMany();
  }
  async findOne(id: string) {
    const e = await this.repo.findOne({ where: { id } });
    if (!e) throw new NotFoundException('Casino event not found');
    return e;
  }
  create(data: any) { return this.repo.save(this.repo.create(data)); }
  async update(id: string, data: any) { await this.repo.update(id, data); return this.findOne(id); }
  async remove(id: string) { return this.repo.delete(id); }
}
