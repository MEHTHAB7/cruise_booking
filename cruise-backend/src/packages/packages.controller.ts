import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { PackagesService } from './packages.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('packages')
@Controller('packages')
export class PackagesController {
  constructor(private readonly svc: PackagesService) {}

  @Get('cruise/:cruiseId')
  @ApiOperation({ summary: 'Get all packages for a cruise' })
  findAllByCruise(@Param('cruiseId') cruiseId: string) {
    return this.svc.findAllByCruise(cruiseId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiCookieAuth('cruise.sid')
  @ApiOperation({ summary: 'Create a new package (Admin)' })
  create(@Body() body: any) {
    return this.svc.create(body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiCookieAuth('cruise.sid')
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
