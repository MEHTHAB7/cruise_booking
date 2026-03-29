import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Room, RoomType } from '../rooms/entities/room.entity';
import { Ship } from '../ships/entities/ship.entity';
import { Package } from '../packages/entities/package.entity';
import { Cruise } from '../cruises/entities/cruise.entity';
import { Port } from '../ports/entities/port.entity';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '250730',
  database: process.env.DB_NAME || 'cruise_booking',
  entities: [Room, Ship, Package, Cruise, Port],
  synchronize: false,
});

const roomImages: Record<string, string> = {
  [RoomType.INSIDE]: '/images/freepik_create-a-cohesive-set-of-ultrahi_4.png',
  [RoomType.OCEAN_VIEW]: '/images/freepik_create-a-cohesive-set-of-ultrahi_1.png',
  [RoomType.BALCONY]: '/images/IMG-20260326-WA0018.jpg',
  [RoomType.SUITE]: '/images/IMG-20260326-WA0019.jpg',
};

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected.');

    const roomRepo = AppDataSource.getRepository(Room);
    const rooms = await roomRepo.find();
    console.log(`Updating ${rooms.length} rooms with images...`);

    for (const room of rooms) {
      const img = roomImages[room.type] || roomImages[RoomType.INSIDE];
      await roomRepo.update(room.id, { imageUrl: img });
    }

    console.log('Room images updated successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Update failed:', err);
    process.exit(1);
  }
}

seed();
