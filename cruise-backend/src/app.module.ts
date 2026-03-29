import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';

// Existing modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BookingsModule } from './bookings/bookings.module';
import { CruisesModule } from './cruises/cruises.module';
import { AdminModule } from './admin/admin.module';
import { ShipsModule } from './ships/ships.module';
import { PortsModule } from './ports/ports.module';
import { AiModule } from './ai/ai.module';

// Rest modules
import { RestaurantsModule } from './restaurants/restaurants.module';
import { RestaurantSlotsModule } from './restaurant-slots/restaurant-slots.module';
import { RoomsModule } from './rooms/rooms.module';
import { ShowsModule } from './shows/shows.module';
import { CasinoEventsModule } from './casino-events/casino-events.module';
import { PackagesModule } from './packages/packages.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      ...(process.env.DATABASE_URL
        ? {
            url: process.env.DATABASE_URL,
          }
        : {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            username: process.env.DB_USERNAME || 'postgres',
            password: process.env.DB_PASSWORD || '250730',
            database: process.env.DB_NAME || 'cruise_booking',
          }),
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
      ssl: process.env.NODE_ENV === 'production',
      extra: process.env.NODE_ENV === 'production' ? {
        ssl: {
          rejectUnauthorized: false,
        },
      } : {},
    }),
    ThrottlerModule.forRoot([{ ttl: 60, limit: 10 }]),
    AiModule,
    AuthModule,
    UsersModule,
    BookingsModule,
    CruisesModule,
    AdminModule,
    ShipsModule,
    PortsModule,
    RestaurantsModule,
    RestaurantSlotsModule,
    RoomsModule,
    ShowsModule,
    CasinoEventsModule,
    PackagesModule,
  ],
})
export class AppModule {}