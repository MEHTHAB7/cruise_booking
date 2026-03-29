import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Package } from './entities/package.entity';

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(Package) private packagesRepo: Repository<Package>,
  ) {}

  async findAllByCruise(cruiseId: string): Promise<Package[]> {
    return this.packagesRepo.find({
      where: { cruise: { id: cruiseId } },
      order: { durationDays: 'ASC' },
      relations: ['cruise']
    });
  }

  async findOne(id: string): Promise<Package> {
    const pkg = await this.packagesRepo.findOne({
      where: { id },
      relations: ['cruise'],
    });
    if (!pkg) throw new NotFoundException(`Package ${id} not found`);
    return pkg;
  }

  async create(data: any): Promise<Package> {
    const pkg = this.packagesRepo.create({
      ...data,
      cruise: { id: data.cruiseId }
    } as any);
    return this.packagesRepo.save(pkg as any) as unknown as Package;
  }

  async remove(id: string): Promise<void> {
    await this.packagesRepo.delete(id);
  }
}
