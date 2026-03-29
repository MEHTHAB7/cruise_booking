import {
  Controller,
  Get,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiCookieAuth, ApiOperation } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../bookings/entities/booking.entity';
import { AdminGuard } from '../common/guards/admin.guard';
import { Throttle } from '@nestjs/throttler';
import { PaginationDto } from './dto/pagination.dto';

@ApiTags('admin')
@ApiCookieAuth('cruise.sid')
@UseGuards(AdminGuard)
@Throttle({ default: { limit: 10, ttl: 60 } })
@Controller('secure-admin-9f3x')
export class AdminController {
  private logger = new Logger(AdminController.name);

  constructor(
    @InjectRepository(Booking) private bookingRepo: Repository<Booking>,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Admin dashboard stats' })
  async dashboard() {
    this.logger.log('Admin accessed dashboard');

    const totalBookings = await this.bookingRepo.count();

    const confirmedBookings = await this.bookingRepo.count({
      where: { status: 'confirmed' as any },
    });

    const revenue = await this.bookingRepo
      .createQueryBuilder('b')
      .select('SUM(b.total_price)', 'total')
      .where('b.status = :s', { s: 'confirmed' })
      .getRawOne();
      
    // New Aggregations
    const revenueByMonth = await this.bookingRepo
      .createQueryBuilder('b')
      .select("TO_CHAR(b.created_at, 'YYYY-MM')", 'month')
      .addSelect('SUM(b.total_price)', 'total')
      .where('b.status = :s', { s: 'confirmed' })
      .groupBy('month')
      .orderBy('month', 'DESC')
      .limit(6)
      .getRawMany();

    const popularCruises = await this.bookingRepo
      .createQueryBuilder('b')
      .leftJoin('b.cruise', 'cruise')
      .select('cruise.name', 'cruiseName')
      .addSelect('COUNT(b.id)', 'bookingCount')
      .addSelect('SUM(b.total_price)', 'totalRevenue')
      .groupBy('cruise.id')
      .addGroupBy('cruise.name')
      .orderBy('"bookingCount"', 'DESC')
      .limit(5)
      .getRawMany();

    const roomTypeDistribution = await this.bookingRepo
      .createQueryBuilder('b')
      .leftJoin('b.room', 'room')
      .select('room.type', 'type')
      .addSelect('COUNT(b.id)', 'count')
      .groupBy('room.type')
      .getRawMany();

    return {
      totalBookings,
      confirmedBookings,
      totalRevenue: Number(revenue?.total ?? 0),
      revenueByMonth: revenueByMonth.map(r => ({ ...r, total: Number(r.total) })),
      popularCruises,
      roomTypeDistribution: roomTypeDistribution.map(r => ({ ...r, count: Number(r.count) }))
    };
  }

  @Get('bookings')
  @ApiOperation({ summary: 'List all bookings (paginated)' })
  async allBookings(@Query() query: PaginationDto) {
    const { page, limit } = query;

    this.logger.log(`Admin requested bookings page=${page} limit=${limit}`);

    return this.bookingRepo.findAndCount({
      relations: ['cruise', 'room', 'user'],
      select: {
        id: true,
        totalPrice: true,
        createdAt: true,
        status: true,
        user: {
          id: true,
          email: true,
        },
      },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }
}