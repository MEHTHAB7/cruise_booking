import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Show } from './entities/show.entity';
@Injectable()
export class ShowsService {
  constructor(@InjectRepository(Show) private repo: Repository<Show>) {}
  findByCruise(cruiseId: string, date?: string) {
    const qb = this.repo.createQueryBuilder('s')
      .leftJoinAndSelect('s.cruise', 'c')
      .where('c.id = :cruiseId', { cruiseId });
    if (date) qb.andWhere('s.show_date = :date', { date });
    return qb.orderBy('s.show_date', 'ASC').addOrderBy('s.start_time', 'ASC').getMany();
  }
  async findOne(id: string) {
    const s = await this.repo.findOne({ where: { id } });
    if (!s) throw new NotFoundException('Show not found');
    return s;
  }
  create(data: any) { return this.repo.save(this.repo.create(data)); }
  async update(id: string, data: any) { await this.repo.update(id, data); return this.findOne(id); }
  async remove(id: string) { return this.repo.delete(id); }
}
