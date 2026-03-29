import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiCookieAuth } from '@nestjs/swagger';
import { CruisesService } from './cruises.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('cruises')
@Controller('cruises')
export class CruisesController {
  constructor(private readonly svc: CruisesService) {}

  @Get()
  @ApiOperation({ summary: 'Search cruises by port and date' })
  @ApiQuery({ name: 'departurePortId', required: false })
  @ApiQuery({ name: 'departureDateFrom', required: false })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  findAll(@Query() query: any) {
    return this.svc.findAll(query);
  }

  @Get(':id') findOne(@Param('id') id: string) { return this.svc.findOne(id); }

  @Post('search')
  @ApiOperation({ summary: 'Search cruises (POST)' })
  search(@Body() body: any) {
    return this.svc.findAll(body);
  }

  @Post() @UseGuards(AuthGuard, RolesGuard) @Roles('admin') @ApiCookieAuth('cruise.sid')
  create(@Body() body: any) { return this.svc.create(body); }

  @Put(':id') @UseGuards(AuthGuard, RolesGuard) @Roles('admin')
  update(@Param('id') id: string, @Body() body: any) { return this.svc.update(id, body); }

  @Delete(':id') @UseGuards(AuthGuard, RolesGuard) @Roles('admin')
  remove(@Param('id') id: string) { return this.svc.remove(id); }
}
