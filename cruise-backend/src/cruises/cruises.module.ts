import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CruisesController } from './cruises.controller';
import { CruisesService } from './cruises.service';
import { Cruise } from './entities/cruise.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Cruise])],
  controllers: [CruisesController],
  providers: [CruisesService],
  exports: [CruisesService],
})
export class CruisesModule {}
