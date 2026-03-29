import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Booking, BookingItem } from './entities/booking.entity';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';

import { Cruise } from '../cruises/entities/cruise.entity';
import { Room } from '../rooms/entities/room.entity';
import { RestaurantSlot } from '../restaurant-slots/entities/restaurant-slot.entity';
import { Show } from '../shows/entities/show.entity';
import { CasinoEvent } from '../casino-events/entities/casino-event.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Booking,
      BookingItem, // ✅ THIS WAS MISSING
      Cruise,
      Room,
      RestaurantSlot,
      Show,
      CasinoEvent,
    ]),
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}