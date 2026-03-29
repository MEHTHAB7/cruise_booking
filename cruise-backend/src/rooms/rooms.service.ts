import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';
@Injectable()
export class RoomsService {
  constructor(@InjectRepository(Room) private repo: Repository<Room>) {}
  findByShip(shipId: string, type?: string) {
    const qb = this.repo.createQueryBuilder('r')
      .leftJoinAndSelect('r.ship', 'ship')
      .where('ship.id = :shipId', { shipId });
    if (type) qb.andWhere('r.type = :type', { type });
    return qb.orderBy('r.deck', 'ASC').addOrderBy('r.room_number', 'ASC').getMany();
  }
  async findOne(id: string) {
    const r = await this.repo.findOne({ where: { id }, relations: ['ship'] });
    if (!r) throw new NotFoundException('Room not found');
    return r;
  }
  async create(data: any) {
    const room = this.repo.create({
      ...data,
      ship: { id: data.shipId }
    } as any);
    return this.repo.save(room);
  }
  async update(id: string, data: any) { await this.repo.update(id, data); return this.findOne(id); }
  async remove(id: string) { return this.repo.delete(id); }
}
