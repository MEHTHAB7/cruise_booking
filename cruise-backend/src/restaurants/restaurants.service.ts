import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Restaurant } from './entities/restaurant.entity';
import { RestaurantSlot } from '../restaurant-slots/entities/restaurant-slot.entity';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private repo: Repository<Restaurant>,

    @InjectRepository(RestaurantSlot)
    private slotRepo: Repository<RestaurantSlot>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  findOne(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  create(body: any) {
    return this.repo.save(this.repo.create(body));
  }

  update(id: string, body: any) {
    return this.repo.update(id, body);
  }

  remove(id: string) {
    return this.repo.delete(id);
  }

  // Dummy compatibility methods (to stop controller errors)

  findByShip(shipId: string) {
    return this.repo.find(); // simplified
  }

  findSlotsByCruiseAndDate(cruiseId: string, date: string) {
    return this.slotRepo.find({ relations: ['restaurant'] });
  }

  createSlot(body: any) {
    return this.slotRepo.save(this.slotRepo.create(body));
  }
}