import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import {
  Booking,
  BookingItem,
  BookingStatus,
  BookingItemType,
} from './entities/booking.entity';

import { Cruise } from '../cruises/entities/cruise.entity';
import { Room, RoomStatus } from '../rooms/entities/room.entity';

// ✅ FIXED IMPORT
import { RestaurantSlot } from '../restaurant-slots/entities/restaurant-slot.entity';

import { Show } from '../shows/entities/show.entity';
import { CasinoEvent } from '../casino-events/entities/casino-event.entity';

import { CreateBookingDto } from './dto/create-booking.dto';
import { AddActivityDto } from './dto/add-activity.dto';

function randomRef(): string {
  return (
    Math.random().toString(36).substring(2, 8).toUpperCase() +
    Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0')
  );
}

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    @InjectRepository(Booking)
    private bookingRepo: Repository<Booking>,

    @InjectRepository(BookingItem)
    private itemRepo: Repository<BookingItem>,

    @InjectRepository(Cruise)
    private cruiseRepo: Repository<Cruise>,

    @InjectRepository(Room)
    private roomRepo: Repository<Room>,

    @InjectRepository(RestaurantSlot)
    private slotRepo: Repository<RestaurantSlot>,

    @InjectRepository(Show)
    private showRepo: Repository<Show>,

    @InjectRepository(CasinoEvent)
    private casinoRepo: Repository<CasinoEvent>,

    private dataSource: DataSource,
  ) {}

  // ── Create booking ─────────────────────────────────────────
  async createBooking(userId: string, dto: CreateBookingDto): Promise<Booking> {
    const cruise = await this.cruiseRepo.findOne({
      where: { id: dto.cruiseId },
      relations: ['ship'],
    });
    if (!cruise) throw new NotFoundException('Cruise not found');

    const room = await this.roomRepo.findOne({
      where: { id: dto.roomId, ship: { id: cruise.ship.id } },
      relations: ['ship'],
    });

    if (!room) throw new NotFoundException('Room not found on this cruise ship');

    if (room.status !== RoomStatus.AVAILABLE) {
      throw new ConflictException('Room is not available');
    }

    const existing = await this.bookingRepo
      .createQueryBuilder('b')
      .where('b.cruise_id = :cruiseId', { cruiseId: dto.cruiseId })
      .andWhere('b.room_id = :roomId', { roomId: dto.roomId })
      .andWhere('b.status != :cancelled', {
        cancelled: BookingStatus.CANCELLED,
      })
      .getOne();

    if (existing) throw new ConflictException('Room already booked');

    const priceMap: Record<string, number> = {
      inside: Number(cruise.basePriceInside),
      ocean_view: Number(cruise.basePriceOceanView),
      balcony: Number(cruise.basePriceBalcony),
      suite: Number(cruise.basePriceSuite),
    };

    const pricePerPerson = priceMap[room.type];
    if (isNaN(pricePerPerson)) {
      throw new BadRequestException('Could not determine price for room type');
    }
    const price = pricePerPerson * dto.guestCount;

    const booking = this.bookingRepo.create({
      bookingReference: randomRef(),
      user: { id: userId } as any,
      cruise,
      room,
      guestCount: dto.guestCount,
      specialRequests: dto.specialRequests,
      totalPrice: price,
      status: BookingStatus.CONFIRMED,
      items: [],
    });

    let saved: Booking;
    try {
      saved = await this.bookingRepo.save(booking);
    } catch (err: any) {
      this.logger.error(`Booking save failed: ${err.message}`);
      if (err.code === '23503') { // Foreign key violation
        throw new UnauthorizedException('Session invalid or user no longer exists. Please log style out and in again.');
      }
      throw err;
    }

    this.logger.log(`Booking created: ${saved.bookingReference}`);

    return saved;
  }

  // ── Add activity ─────────────────────────────────────────
  async addActivity(
    bookingId: string,
    userId: string,
    dto: AddActivityDto,
  ): Promise<BookingItem> {
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId, user: { id: userId } },
      relations: ['items'],
    });

    if (!booking) throw new NotFoundException('Booking not found');

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking cancelled');
    }

    let itemName: string;
    let activityDate: Date;
    let startTime: string;
    let endTime: string;
    let itemType: BookingItemType;

    // ✅ RESTAURANT SLOT
    if (dto.type === 'restaurant_slot') {
      const slot = await this.slotRepo.findOne({
        where: { id: dto.itemId },
        relations: ['restaurant'],
      });

      if (!slot) throw new NotFoundException('Restaurant slot not found');

      itemName = `Dining at ${slot.restaurant.name}`;
      activityDate = new Date(slot.slotDate);
      startTime = slot.startTime;
      endTime = slot.endTime;
      itemType = BookingItemType.RESTAURANT;
    }

    // ✅ SHOW
    else if (dto.type === 'show') {
      const show = await this.showRepo.findOne({
        where: { id: dto.itemId },
      });

      if (!show) throw new NotFoundException('Show not found');

      itemName = show.name;
      activityDate = show.showDate;
      startTime = show.startTime;

      const [h, m] = show.startTime.split(':').map(Number);
      const endDate = new Date(0, 0, 0, h, m + show.durationMinutes);

      endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(
        endDate.getMinutes(),
      ).padStart(2, '0')}`;

      itemType = BookingItemType.SHOW;
    }

    // ✅ CASINO
    else if (dto.type === 'casino_event') {
      const ev = await this.casinoRepo.findOne({
        where: { id: dto.itemId },
      });

      if (!ev) throw new NotFoundException('Casino event not found');

      itemName = ev.name;
      activityDate = ev.eventDate;
      startTime = ev.startTime;

      const [h, m] = ev.startTime.split(':').map(Number);
      const endDate = new Date(0, 0, 0, h, m + ev.durationMinutes);

      endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(
        endDate.getMinutes(),
      ).padStart(2, '0')}`;

      itemType = BookingItemType.CASINO;
    } else {
      throw new BadRequestException('Invalid activity type');
    }

    // ── Conflict check ─────────────────────
    const toDateStr = (d: Date | string) => {
      const dt = new Date(d);
      // Using UTC parts to ensure consistency with the DB 'date' type which is often parsed as UTC 00:00
      return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`;
    };

    const newDateStr = toDateStr(activityDate); 

    this.logger.debug(`Checking conflict for new activity on ${newDateStr} at ${startTime}-${endTime}`);

    for (const ex of booking.items) {
      const exDateStr = toDateStr(ex.activityDate);
      
      this.logger.debug(`Comparing with existing: ${ex.itemName} on ${exDateStr} at ${ex.startTime}-${ex.endTime}`);

      if (
        exDateStr === newDateStr &&
        this.timesOverlap(
          ex.startTime,
          ex.endTime,
          startTime,
          endTime,
        )
      ) {
        this.logger.warn(`CONFLICT DETECTED: ${ex.itemName} overlaps with new activity`);
        throw new ConflictException(
          'You cannot book two extra events at same time in same day'
        );
      }
    }

    const item = this.itemRepo.create({
      booking: { id: bookingId } as any,
      itemType,
      itemId: dto.itemId,
      itemName,
      activityDate,
      startTime,
      endTime,
    });

    return this.itemRepo.save(item);
  }

  private timesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string) {
    const toMin = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    return toMin(aStart) < toMin(bEnd) && toMin(bStart) < toMin(aEnd);
  }

  async findUserBookings(userId: string): Promise<Booking[]> {
    return this.bookingRepo.find({
      where: { user: { id: userId } },
      relations: ['cruise', 'room', 'items'],
      order: { createdAt: 'DESC' },
    });
  }

  async cancelBooking(bookingId: string, userId: string) {
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId, user: { id: userId } },
    });

    if (!booking) throw new NotFoundException('Booking not found');

    booking.status = BookingStatus.CANCELLED;

    return this.bookingRepo.save(booking);
  }
  
  async findOneForUser(bookingId: string, userId: string): Promise<Booking> {
  const booking = await this.bookingRepo.findOne({
    where: { id: bookingId, user: { id: userId } },
    relations: ['cruise', 'room', 'items'],
  });

  if (!booking) throw new NotFoundException('Booking not found');

  return booking;
  }
}