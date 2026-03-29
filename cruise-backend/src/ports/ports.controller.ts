import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { PortsService } from './ports.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
@ApiTags('ports')
@Controller('ports')
export class PortsController {
  constructor(private readonly svc: PortsService) {}
  @Get() findAll() { return this.svc.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.svc.findOne(id); }
  @Post() @UseGuards(AuthGuard, RolesGuard) @Roles('admin') @ApiCookieAuth('cruise.sid')
  create(@Body() body: any) { return this.svc.create(body); }
  @Put(':id') @UseGuards(AuthGuard, RolesGuard) @Roles('admin')
  update(@Param('id') id: string, @Body() body: any) { return this.svc.update(id, body); }
  @Delete(':id') @UseGuards(AuthGuard, RolesGuard) @Roles('admin')
  remove(@Param('id') id: string) { return this.svc.remove(id); }
}
