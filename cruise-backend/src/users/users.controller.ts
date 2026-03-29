import { Controller, Get, Put, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { UsersService } from './users.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
@ApiTags('users')
@ApiCookieAuth('cruise.sid')
@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly svc: UsersService) {}
  @Get() @UseGuards(RolesGuard) @Roles('admin') findAll() { return this.svc.findAll(); }
  @Get('profile') profile(@Req() req: Request) {
    return this.svc.findOne((req.session as any).userId);
  }
  @Put('profile') updateProfile(@Req() req: Request, @Body() body: any) {
    return this.svc.update((req.session as any).userId, body);
  }
}
