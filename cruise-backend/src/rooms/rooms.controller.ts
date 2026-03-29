import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiQuery, ApiCookieAuth } from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
@ApiTags('rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly svc: RoomsService) {}
  @Get('ship/:shipId') @ApiQuery({ name: 'type', required: false })
  findByShip(@Param('shipId') shipId: string, @Query('type') type?: string) {
    return this.svc.findByShip(shipId, type);
  }
  @Get(':id') findOne(@Param('id') id: string) { return this.svc.findOne(id); }
  @Post() @UseGuards(AuthGuard, RolesGuard) @Roles('admin') @ApiCookieAuth('cruise.sid')
  create(@Body() body: any) { return this.svc.create(body); }
  @Put(':id') @UseGuards(AuthGuard, RolesGuard) @Roles('admin')
  update(@Param('id') id: string, @Body() body: any) { return this.svc.update(id, body); }
  @Delete(':id') @UseGuards(AuthGuard, RolesGuard) @Roles('admin')
  remove(@Param('id') id: string) { return this.svc.remove(id); }
}
