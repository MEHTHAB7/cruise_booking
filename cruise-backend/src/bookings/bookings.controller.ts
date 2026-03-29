import {
  Controller, Post, Get, Delete, Body, Param, Req,
  UseGuards, ParseUUIDPipe, Query, UseInterceptors, ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { AddActivityDto } from './dto/add-activity.dto';
import { AuthGuard } from '../common/guards/auth.guard';

@ApiTags('bookings')
@ApiCookieAuth('cruise.sid')
@UseGuards(AuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new cruise + room booking' })
  create(@Body() dto: CreateBookingDto, @Req() req: Request) {
    return this.bookingsService.createBooking((req.session as any).userId, dto);
  }

  @Get('my-bookings')
  @ApiOperation({ summary: 'List all bookings for the current user' })
  myBookings(@Req() req: Request) {
    return this.bookingsService.findUserBookings((req.session as any).userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single booking detail' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.bookingsService.findOneForUser(id, (req.session as any).userId);
  }

  @Post(':id/activities')
  @ApiOperation({ summary: 'Add an activity to an existing booking (conflict-checked)' })
  addActivity(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddActivityDto,
    @Req() req: Request,
  ) {
    return this.bookingsService.addActivity(id, (req.session as any).userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel a booking' })
  cancel(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.bookingsService.cancelBooking(id, (req.session as any).userId);
  }
}
