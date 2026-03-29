import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiQuery, ApiCookieAuth } from '@nestjs/swagger';
import { CasinoEventsService } from './casino-events.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
@ApiTags('casino-events')
@Controller('casino-events')
export class CasinoEventsController {
  constructor(private readonly svc: CasinoEventsService) {}
  @Get('cruise/:cruiseId') @ApiQuery({ name: 'date', required: false })
  findByCruise(@Param('cruiseId') id: string, @Query('date') date?: string) {
    return this.svc.findByCruise(id, date);
  }
  @Get(':id') findOne(@Param('id') id: string) { return this.svc.findOne(id); }
  @Post() @UseGuards(AuthGuard, RolesGuard) @Roles('admin') @ApiCookieAuth('cruise.sid')
  create(@Body() body: any) { return this.svc.create(body); }
  @Put(':id') @UseGuards(AuthGuard, RolesGuard) @Roles('admin')
  update(@Param('id') id: string, @Body() body: any) { return this.svc.update(id, body); }
  @Delete(':id') @UseGuards(AuthGuard, RolesGuard) @Roles('admin')
  remove(@Param('id') id: string) { return this.svc.remove(id); }
}
