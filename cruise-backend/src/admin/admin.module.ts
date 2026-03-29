import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { Booking } from '../bookings/entities/booking.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Booking])],
  controllers: [AdminController],
})
export class AdminModule {}
