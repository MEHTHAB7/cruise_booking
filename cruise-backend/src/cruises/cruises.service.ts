import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cruise } from './entities/cruise.entity';

@Injectable()
export class CruisesService {
  constructor(@InjectRepository(Cruise) private repo: Repository<Cruise>) {}

  async findAll(filters: any = {}) {
    const { 
      departurePortId, 
      departureDateFrom, 
      minPrice, 
      maxPrice, 
      minDuration, 
      maxDuration, 
      shipName, 
      destination,
      sortBy = 'departure_date',
      sortOrder = 'ASC'
    } = filters;

    const qb = this.repo.createQueryBuilder('c')
      .leftJoinAndSelect('c.ship', 'ship')
      .leftJoinAndSelect('c.departurePort', 'dep')
      .leftJoinAndSelect('c.destinationPort', 'dst')
      .where('c.status = :status', { status: 'active' });

    if (departurePortId) qb.andWhere('dep.id = :portId', { portId: departurePortId });
    if (departureDateFrom) qb.andWhere('c.departure_date >= :date', { date: departureDateFrom });
    
    // Price Filter (based on basePriceInside as the starting point)
    if (minPrice) qb.andWhere('c.base_price_inside >= :minP', { minP: minPrice });
    if (maxPrice) qb.andWhere('c.base_price_inside <= :maxP', { maxP: maxPrice });

    // Duration Filter
    if (minDuration) qb.andWhere('c.duration_nights >= :minD', { minD: minDuration });
    if (maxDuration) qb.andWhere('c.duration_nights <= :maxD', { maxD: maxDuration });

    // Ship Name Filter
    if (shipName) qb.andWhere('ship.name ILIKE :ship', { ship: `%${shipName}%` });

    // Destination Filter (Fuzzy search in cruise name and port names)
    if (destination) {
      qb.andWhere('(c.name ILIKE :dest OR dst.name ILIKE :dest OR dst.city ILIKE :dest)', { dest: `%${destination}%` });
    }

    // Sorting
    const allowedSortFields = {
      'departure_date': 'c.departure_date',
      'price': 'c.base_price_inside',
      'duration': 'c.duration_nights'
    };
    const sortField = allowedSortFields[sortBy] || 'c.departure_date';
    qb.orderBy(sortField, sortOrder as 'ASC' | 'DESC');

    return qb.getMany();
  }

  async findOne(id: string) {
    const c = await this.repo.findOne({
      where: { id },
      relations: ['ship', 'departurePort', 'destinationPort'],
    });
    if (!c) throw new NotFoundException('Cruise not found');
    return c;
  }

  async create(data: any) {
    const cruise = this.repo.create({
      ...data,
      ship: { id: data.shipId },
      departurePort: { id: data.departurePortId },
      destinationPort: { id: data.destinationPortId }
    } as any);
    return this.repo.save(cruise);
  }
  async update(id: string, data: any) { await this.repo.update(id, data); return this.findOne(id); }
  async remove(id: string) { return this.repo.delete(id); }
}
