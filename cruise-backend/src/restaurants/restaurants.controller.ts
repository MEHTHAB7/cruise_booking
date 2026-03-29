import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiQuery, ApiCookieAuth } from '@nestjs/swagger';
import { RestaurantsService } from './restaurants.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
@ApiTags('restaurants')
@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly svc: RestaurantsService) {}
  @Get('ship/:shipId') findByShip(@Param('shipId') shipId: string) { return this.svc.findByShip(shipId); }
  @Get('slots/cruise/:cruiseId') @ApiQuery({ name: 'date', required: false })
  findSlots(@Param('cruiseId') cruiseId: string, @Query('date') date?: string) {
    return this.svc.findSlotsByCruiseAndDate(cruiseId, date);
  }
  @Get(':id') findOne(@Param('id') id: string) { return this.svc.findOne(id); }
  @Post() @UseGuards(AuthGuard, RolesGuard) @Roles('admin') @ApiCookieAuth('cruise.sid')
  create(@Body() body: any) { return this.svc.create(body); }
  @Post('slots') @UseGuards(AuthGuard, RolesGuard) @Roles('admin')
  createSlot(@Body() body: any) { return this.svc.createSlot(body); }
  @Put(':id') @UseGuards(AuthGuard, RolesGuard) @Roles('admin')
  update(@Param('id') id: string, @Body() body: any) { return this.svc.update(id, body); }
  @Delete(':id') @UseGuards(AuthGuard, RolesGuard) @Roles('admin')
  remove(@Param('id') id: string) { return this.svc.remove(id); }
}
