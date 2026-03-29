import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CasinoEventsController } from './casino-events.controller';
import { CasinoEventsService } from './casino-events.service';
import { CasinoEvent } from './entities/casino-event.entity';
@Module({
  imports: [TypeOrmModule.forFeature([CasinoEvent])],
  controllers: [CasinoEventsController],
  providers: [CasinoEventsService],
  exports: [CasinoEventsService],
})
export class CasinoEventsModule {}
