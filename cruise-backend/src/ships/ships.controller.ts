import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { ShipsService } from './ships.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('ships')
@Controller('ships')
export class ShipsController {
  constructor(private readonly svc: ShipsService) {}
  @Get() findAll() { return this.svc.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.svc.findOne(id); }
  @Post() @UseGuards(AuthGuard, RolesGuard) @Roles('admin') @ApiCookieAuth('cruise.sid')
  create(@Body() body: any) { return this.svc.create(body); }
  @Put(':id') @UseGuards(AuthGuard, RolesGuard) @Roles('admin') @ApiCookieAuth('cruise.sid')
  update(@Param('id') id: string, @Body() body: any) { return this.svc.update(id, body); }
  @Delete(':id') @UseGuards(AuthGuard, RolesGuard) @Roles('admin') @ApiCookieAuth('cruise.sid')
  remove(@Param('id') id: string) { return this.svc.remove(id); }
}
