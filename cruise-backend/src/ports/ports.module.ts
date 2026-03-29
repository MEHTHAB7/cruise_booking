import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Port } from './entities/port.entity';
import { PortsController } from './ports.controller';
import { PortsService } from './ports.service';

@Module({
  imports: [TypeOrmModule.forFeature([Port])],
  controllers: [PortsController],  
  providers: [PortsService],        
})
export class PortsModule {}