/**
 * Seed script – run with:
 *   npm run seed
 * Populates: ships, ports, cruises, rooms, restaurants, restaurant_slots,
 *             shows, casino_events, and a demo admin user.
 */
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
dotenv.config();

import { Ship } from '../../ships/entities/ship.entity';
import { Port } from '../../ports/entities/port.entity';
import { Cruise, CruiseStatus } from '../../cruises/entities/cruise.entity';
import { Room, RoomType, RoomStatus } from '../../rooms/entities/room.entity';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { RestaurantSlot } from '../../restaurant-slots/entities/restaurant-slot.entity';
import { Show } from '../../shows/entities/show.entity';
import { CasinoEvent, CasinoGameType } from '../../casino-events/entities/casino-event.entity';
import { User, UserRole } from '../../users/entities/user.entity';
import { Package } from '../../packages/entities/package.entity';

const ds = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'cruise_booking',
  entities: [Ship, Port, Cruise, Room, Restaurant, RestaurantSlot, Show, CasinoEvent, User, Package],
  synchronize: false,
});

class ImageManager {
  // Using static arrays as specified by user, removing api fetch code.
}

const imgManager = new ImageManager();

async function seed() {
  await ds.initialize();
  console.log('🌱 Seeding database…');

  await ds.dropDatabase();
  await ds.synchronize();

  // ── Create user_sessions table for connect-pg-simple ───────────────────────
  await ds.query(`
    CREATE TABLE IF NOT EXISTS "user_sessions" (
      "sid" varchar NOT NULL COLLATE "default",
      "sess" json NOT NULL,
      "expire" timestamp(6) NOT NULL
    ) WITH (OIDS=FALSE);
    
    DO $$ 
    BEGIN 
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_sessions_pkey') THEN
        ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
      END IF;
    END $$;

    CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "user_sessions" ("expire");
  `);

  // ── Admin and Guest Users ───────────────────────────────────────────────────
  const userRepo = ds.getRepository(User);
  const existing = await userRepo.findOne({ where: { email: 'admin@cruiseline.com' } });
  if (!existing) {
    await userRepo.save(userRepo.create({
      email: 'admin@cruiseline.com',
      passwordHash: await bcrypt.hash('Admin1234!', 12),
      firstName: 'Alex',
      lastName: 'Admin',
      role: UserRole.ADMIN,
      privacyAccepted: true,
    }));
  }

  const guest = await userRepo.findOne({ where: { email: 'guest@example.com' } });
  if (!guest) {
    await userRepo.save(userRepo.create({
      email: 'guest@example.com',
      passwordHash: await bcrypt.hash('Guest1234!', 12),
      firstName: 'Jane',
      lastName: 'Doe',
      role: UserRole.GUEST,
      privacyAccepted: true,
      marketingConsent: true,
    }));
  }
  console.log('  ✓ Users created');

  // ── Ports ──────────────────────────────────────────────────────────────────
  const portRepo = ds.getRepository(Port);
  const ports = await portRepo.save([
    { name: 'Port of Singapore', city: 'Singapore', country: 'Singapore', countryCode: 'SG', latitude: 1.290270, longitude: 103.851959, description: 'One of Asia’s biggest cruise hubs.' },
    { name: 'Port of Dubai', city: 'Dubai', country: 'UAE', countryCode: 'AE', latitude: 25.2048, longitude: 55.2708, description: 'Luxury cruise destination.' },
    { name: 'Port of Phuket', city: 'Phuket', country: 'Thailand', countryCode: 'TH', latitude: 7.8906, longitude: 98.3981, description: 'Known for beaches and island tours.' },
    { name: 'Port of Barcelona', city: 'Barcelona', country: 'Spain', countryCode: 'ES', latitude: 41.3851, longitude: 2.1734, description: 'One of the busiest cruise ports in Europe.' },
    { name: 'Civitavecchia', city: 'Rome', country: 'Italy', countryCode: 'IT', latitude: 42.0924, longitude: 11.7954, description: 'Access to historic sites like Colosseum.' },
    { name: 'Port of Southampton', city: 'Southampton', country: 'UK', countryCode: 'GB', latitude: 50.8970, longitude: -1.4042, description: 'Major departure port for Northern Europe cruises.' },
    { name: 'Port of Cape Town', city: 'Cape Town', country: 'South Africa', countryCode: 'ZA', latitude: -33.9249, longitude: 18.4241, description: 'Iconic destination with Table Mountain.' },
    { name: 'Port of Durban', city: 'Durban', country: 'South Africa', countryCode: 'ZA', latitude: -29.8587, longitude: 31.0218, description: 'Known for beaches and cultural mix.' },
    { name: 'Port of Casablanca', city: 'Casablanca', country: 'Morocco', countryCode: 'MA', latitude: 33.5731, longitude: -7.5898, description: 'Gateway to Moroccan culture.' },
    { name: 'Port of Miami', city: 'Miami', country: 'USA', countryCode: 'US', latitude: 25.7742, longitude: -80.1747, description: 'Cruise Capital of the World' },
    { name: 'Port of Cozumel', city: 'Cozumel', country: 'Mexico', countryCode: 'MX', latitude: 20.5088, longitude: -86.9558, description: 'Tropical Mexican paradise' },
  ]);
  const [singapore, dubai, phuket, barcelona, rome, southampton, capetown, durban, casablanca, miami, cozumel] = ports;

  // ── Ships & Cruises ────────────────────────────────────────────────────────
  const shipImages = [
    'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13',
    'https://images.unsplash.com/photo-1548574505-5e239809ee19',
    'https://images.unsplash.com/photo-1500375592092-40eb2168fd21',
  ];

  const shipRepo = ds.getRepository(Ship);
  const [carnival, royalCaribbean, princess] = await shipRepo.save([
    {
      name: 'Carnival Cruise Line', totalRooms: 1500, passengerCapacity: 3000, crewCapacity: 1000, decks: 14, yearBuilt: 2018,
      description: 'Carnival Cruise Line - Fun & party style!',
      amenities: ['Interior rooms (budget)', 'Ocean View rooms', 'Balcony rooms', 'Suites', 'Comedy shows', 'Private Island'],
      imageUrl: shipImages[0],
    },
    {
      name: 'Royal Caribbean International', totalRooms: 2500, passengerCapacity: 5000, crewCapacity: 2000, decks: 16, yearBuilt: 2020,
      description: 'Royal Caribbean International - Adventure & tech!',
      amenities: ['Interior rooms', 'Oceanview', 'Balcony', 'Luxury suites', 'Ice skating shows', 'Surf simulator'],
      imageUrl: shipImages[1],
    },
    {
      name: 'Princess Cruises', totalRooms: 1834, passengerCapacity: 5000, crewCapacity: 1500, decks: 15, yearBuilt: 2019,
      description: 'Princess Cruises - Relaxed & premium!',
      amenities: ['Interior', 'Oceanview', 'Balcony', 'Mini-suites & suites', 'Movies Under the Stars'],
      imageUrl: shipImages[2],
    },
  ]);
  console.log('  ✓ 3 ships');

  const cruiseRepo = ds.getRepository(Cruise);
  const cruises = await cruiseRepo.save([
    {
      name: 'Carnival Cruise Line', ship: carnival, departurePort: miami, destinationPort: cozumel,
      departureDate: new Date('2026-04-10'), returnDate: new Date('2026-04-17'), durationNights: 7, status: CruiseStatus.ACTIVE,
      basePriceInside: 599, basePriceOceanView: 799, basePriceBalcony: 1099, basePriceSuite: 2199,
      description: 'Regional Caribbean cruise!',
      imageUrl: shipImages[0],
    },
    {
      name: 'Royal Caribbean International', ship: royalCaribbean, departurePort: southampton, destinationPort: rome,
      departureDate: new Date('2026-06-05'), returnDate: new Date('2026-06-25'), durationNights: 20, status: CruiseStatus.ACTIVE,
      basePriceInside: 1899, basePriceOceanView: 2299, basePriceBalcony: 3199, basePriceSuite: 6499,
      description: 'Regional European cruise starting from Northern Europe.',
      imageUrl: shipImages[1],
    },
    {
      name: 'Princess Cruises', ship: princess, departurePort: singapore, destinationPort: casablanca,
      departureDate: new Date('2026-10-01'), returnDate: new Date('2026-11-20'), durationNights: 50, status: CruiseStatus.ACTIVE,
      basePriceInside: 4999, basePriceOceanView: 5999, basePriceBalcony: 8999, basePriceSuite: 15999,
      description: 'A magnificent journey connecting Asia, Europe, and Africa.',
      imageUrl: shipImages[2],
    },
  ]);
  console.log(`  ✓ 3 cruises`);

  // ── Rooms ──────────────────────────────────────────────────────────────────
  const roomRepo = ds.getRepository(Room);
  const roomData: Partial<Room>[] = [];
  
  const shipConfigs = [
    { ship: carnival, titleIdx: 0 },
    { ship: royalCaribbean, titleIdx: 1 },
    { ship: princess, titleIdx: 2 },
  ];

  const oceanViewImgs = [
    '/ocean view/1000150346.png', '/ocean view/1000150347.png', '/ocean view/1000150351.png', '/ocean view/1000150352.png',
    '/ocean view/1000150355.png', '/ocean view/1000150356.png', '/ocean view/1000150357.png', '/ocean view/1000150361.png',
    '/ocean view/Gemini_Generated_Image_19e84p19e84p19e8.png', '/ocean view/Gemini_Generated_Image_cqdfldcqdfldcqdf.png'
  ];
  const suiteImgs = [
    '/suite/Gemini_Generated_Image_2h095o2h095o2h09.png', '/suite/Gemini_Generated_Image_6tpdf76tpdf76tpd.png', '/suite/Gemini_Generated_Image_9d789r9d789r9d78.png',
    '/suite/Gemini_Generated_Image_9md9dc9md9dc9md9.png', '/suite/Gemini_Generated_Image_ccqdxaccqdxaccqd.png', '/suite/Gemini_Generated_Image_dazgaldazgaldazg.png',
    '/suite/Gemini_Generated_Image_e5y0xre5y0xre5y0.png', '/suite/Gemini_Generated_Image_hzx9kuhzx9kuhzx9.png', '/suite/Gemini_Generated_Image_miv40omiv40omiv4.png', '/suite/Gemini_Generated_Image_nwsezunwsezunwse.png'
  ];
  const insideImgs = [
    '/images/IMG-20260326-WA0010.jpg', '/images/IMG-20260326-WA0011(1).jpg', '/images/IMG-20260326-WA0016.jpg', '/images/IMG-20260326-WA0018.jpg',
    '/images/IMG-20260326-WA0019.jpg', '/images/IMG-20260326-WA0022.jpg', '/images/IMG-20260326-WA0023.jpg', '/images/IMG-20260326-WA0025.jpg',
    '/images/IMG-20260326-WA0027.jpg', '/images/IMG-20260326-WA0029.jpg'
  ];

  let rNum = 100;
  for (const cfg of shipConfigs) {
    const baseSig = cfg.titleIdx * 120; // CARN:0, RC:120, PR:240
    
    // Distribute rooms into 3 packages per ship (40 sigs each)
    for (let pkgIdx = 0; pkgIdx < 3; pkgIdx++) {
      const pkgSigOffset = baseSig + (pkgIdx * 40);
      
      const typesToGenerate = [
        { count: 10, type: RoomType.INSIDE, decks: [4, 5], maxOcc: 2, size: 150, imgs: insideImgs },
        { count: 10, type: RoomType.OCEAN_VIEW, decks: [6, 7], maxOcc: 3, size: 185, imgs: oceanViewImgs },
        { count: 10, type: RoomType.BALCONY, decks: [8, 9, 10], maxOcc: 3, size: 220, imgs: oceanViewImgs },
        { count: 10, type: RoomType.SUITE, decks: [11, 12], maxOcc: 4, size: 480, imgs: suiteImgs },
      ];
      
      for (const t of typesToGenerate) {
        for (let i = 0; i < t.count; i++) {
          roomData.push({
            ship: cfg.ship, roomNumber: String(rNum++), deck: t.decks[i % t.decks.length], type: t.type,
            maxOccupancy: t.maxOcc, sizeSqft: t.size, status: RoomStatus.AVAILABLE,
            imageUrl: t.imgs[i % t.imgs.length],
          });
        }
      }
    }
  }
  await roomRepo.save(roomData);
  console.log(`  ✓ Rooms generated (360 total with exact sig logic)`);

  // ── Restaurants ────────────────────────────────────────────────────────────
  const restRepo = ds.getRepository(Restaurant);
  const slotRepo = ds.getRepository(RestaurantSlot);
  
  const restaurantDefs = [
    { name: 'The Global Spread', cuisine: 'Buffet', dressCode: 'Casual', description: 'All you can eat global foods.', imageUrl: '/DINING OPTIONS-20260328T153504Z-3-001/DINING OPTIONS/ideogram-v3.0_a_cinematic_photo_of_Create_a_photorealistic_image_of_THE_GLOBAL_SPREAD_buffet_r-0.jpg' },
    { name: 'Sunrise Breakfast Buffet', cuisine: 'Buffet', dressCode: 'Casual', description: 'Morning classics.', imageUrl: '/DINING OPTIONS-20260328T153504Z-3-001/DINING OPTIONS/lucid-origin_a_cinematic_photo_of_Create_a_photorealistic_image_of_SUNRISE_BREAKFAST_BUFFET_o-0.jpg' },
    { name: 'Midnight Snacks', cuisine: 'Buffet', dressCode: 'Casual', description: 'Late night cravings.', imageUrl: '/DINING OPTIONS-20260328T153504Z-3-001/DINING OPTIONS/Firefly_Create a photorealistic image of Sweet Tooth Cafe (Desserts & Coffees) fine dining re 183084.png' },
    { name: 'Oceanic Elegance', cuisine: 'Fine Dining', dressCode: 'Formal', description: 'Michelin-inspired tasting menu.', imageUrl: '/DINING OPTIONS-20260328T153504Z-3-001/DINING OPTIONS/ideogram-v3.0_a_cinematic_photo_of_Create_a_photorealistic_image_of_OCEANIC_ELEGANCE_fine_dini-0.jpg' },
    { name: 'Le Petit Chef', cuisine: 'French', dressCode: 'Formal', description: 'Cinematic dining experience.', imageUrl: '/DINING OPTIONS-20260328T153504Z-3-001/DINING OPTIONS/Firefly_Create a photorealistic image of Le Petit Chef (French Fine Dining)_ fine dining rest 183084.png' },
    { name: 'Tokyo Teppanyaki', cuisine: 'Japanese', dressCode: 'Smart Casual', description: 'Thrilling teppanyaki cooking.', imageUrl: '/DINING OPTIONS-20260328T153504Z-3-001/DINING OPTIONS/Firefly_Create a photorealistic image of Tokyo Teppanyaki (Japanese Fine Dining) fine dining  183084.png' },
    { name: 'Sweet Tooth Cafe', cuisine: 'Desserts & Coffees', dressCode: 'Casual', description: 'Artisanal pastries.', imageUrl: '/DINING OPTIONS-20260328T153504Z-3-001/DINING OPTIONS/Firefly_Create a photorealistic image of Sweet Tooth Cafe (Desserts & Coffees) fine dining re 183084.png' },
    { name: 'Wake Up Coffee', cuisine: 'Coffee', dressCode: 'Casual', description: 'Fresh roasted coffee.', imageUrl: '/DINING OPTIONS-20260328T153504Z-3-001/DINING OPTIONS/Firefly_Create a photorealistic image of Wake Up Coffee (Coffee Cafe) fine dining restaurant  183084.png' },
    { name: 'The Vegan Garden', cuisine: 'Plant-Based', dressCode: 'Casual', description: 'Fresh, organic meals.', imageUrl: '/DINING OPTIONS-20260328T153504Z-3-001/DINING OPTIONS/Firefly_Create a photorealistic image of The Vegan Garden (Plant-Based Cafe) fine dining rest 183084.png' },
    { name: 'Bionic Bar', cuisine: 'Cocktails', dressCode: 'Smart Casual', description: 'Tech meets cocktails.', imageUrl: '/DINING OPTIONS-20260328T153504Z-3-001/DINING OPTIONS/Bionic Bar (Cocktails).png' },
    { name: 'Wine & Jazz Lounge', cuisine: 'Tapas & Wine', dressCode: 'Smart Casual', description: 'Massive wine selection.', imageUrl: '/images/IMG-20260326-WA0002.jpg' },
    { name: 'Poolside Drinks', cuisine: 'Bar', dressCode: 'Casual', description: 'Tropical drinks by the pool.', imageUrl: '/DINING OPTIONS-20260328T153504Z-3-001/DINING OPTIONS/Poolside Drinks (Tropical Bar).png' },
  ];
  const restaurants = await restRepo.save(restaurantDefs.map(d => restRepo.create(d)));

  const slotDefs: Partial<RestaurantSlot>[] = [];
  for (const cruise of cruises) {
    for (let night = 0; night < 2; night++) { // Limit to 2 nights to save seed time
      const slotDate = new Date(cruise.departureDate);
      slotDate.setDate(slotDate.getDate() + night);
      for (const rest of restaurants) {
        slotDefs.push({ restaurant: rest, slotDate: new Date(slotDate), startTime: '18:00', endTime: '20:00', capacity: 40 });
      }
    }
  }
  await slotRepo.save(slotDefs);
  console.log(`  ✓ 12 Restaurants created`);

  // ── Shows ──────────────────────────────────────────────────────────────────
  const showRepo = ds.getRepository(Show);
  
  const showDefs = [
    { ship: royalCaribbean, name: 'Broadway Nights', genre: 'Musical', venue: 'Main Theatre', durationMinutes: 90, capacity: 400, ageRestriction: null, imageUrl: '/ENTERTAINMENT & SHOWS-20260328T153502Z-3-001/ENTERTAINMENT & SHOWS/Broadway Nights.png' },
    { ship: carnival, name: 'Comedy Gala', genre: 'Comedy', venue: 'Sky Lounge', durationMinutes: 60, capacity: 200, ageRestriction: 18, imageUrl: '/ENTERTAINMENT & SHOWS-20260328T153502Z-3-001/ENTERTAINMENT & SHOWS/Gemini_Generated_Image_5v3mk55v3mk55v3m.png' },
    { ship: princess, name: 'Illusionist Spectacular', genre: 'Magic', venue: 'Grand Auditorium', durationMinutes: 75, capacity: 350, ageRestriction: null, imageUrl: '/ENTERTAINMENT & SHOWS-20260328T153502Z-3-001/ENTERTAINMENT & SHOWS/Gemini_Generated_Image_xkqfy0xkqfy0xkqf.png' },
    { ship: royalCaribbean, name: 'Rock the Boat', genre: 'Live Music', venue: 'Pool Deck', durationMinutes: 120, capacity: 500, ageRestriction: null, imageUrl: '/images/IMG-20260326-WA0026.jpg' },
    { ship: carnival, name: 'Latin Dance Night', genre: 'Dance', venue: 'Salsa Club', durationMinutes: 90, capacity: 200, ageRestriction: null, imageUrl: '/ENTERTAINMENT & SHOWS-20260328T153502Z-3-001/ENTERTAINMENT & SHOWS/Broadway Nights.png' },
    { ship: princess, name: 'Jazz & Wine Evening', genre: 'Music', venue: 'Jazz Lounge', durationMinutes: 150, capacity: 150, ageRestriction: 18, imageUrl: '/images/IMG-20260326-WA0024.jpg' },
    { ship: princess, name: 'Movies Under Stars', genre: 'Cinema', venue: 'Upper Deck', durationMinutes: 130, capacity: 400, ageRestriction: null, imageUrl: '/ENTERTAINMENT & SHOWS-20260328T153502Z-3-001/ENTERTAINMENT & SHOWS/Gemini_Generated_Image_5v3mk55v3mk55v3m.png' },
    { ship: royalCaribbean, name: 'Aqua Theatre', genre: 'Acrobatics', venue: 'Aqua Theatre', durationMinutes: 45, capacity: 250, ageRestriction: null, imageUrl: '/ENTERTAINMENT & SHOWS-20260328T153502Z-3-001/ENTERTAINMENT & SHOWS/Gemini_Generated_Image_xkqfy0xkqfy0xkqf.png' },
    { ship: carnival, name: 'Carnival Juggling', genre: 'Variety', venue: 'Atrium', durationMinutes: 30, capacity: 150, ageRestriction: null, imageUrl: '/ENTERTAINMENT & SHOWS-20260328T153502Z-3-001/ENTERTAINMENT & SHOWS/Broadway Nights.png' },
    { ship: carnival, name: 'Late Night DJ Set', genre: 'Dance', venue: 'Nightclub', durationMinutes: 180, capacity: 400, ageRestriction: 21, imageUrl: '/images/IMG-20260326-WA0026.jpg' },
    { ship: royalCaribbean, name: 'White Party', genre: 'Party', venue: 'Pool Deck', durationMinutes: 180, capacity: 400, ageRestriction: 18, imageUrl: '/ENTERTAINMENT & SHOWS-20260328T153502Z-3-001/ENTERTAINMENT & SHOWS/Gemini_Generated_Image_5v3mk55v3mk55v3m.png' },
    { ship: princess, name: 'Starlight Gala', genre: 'Party', venue: 'Main Deck', durationMinutes: 120, capacity: 300, ageRestriction: null, imageUrl: '/ENTERTAINMENT & SHOWS-20260328T153502Z-3-001/ENTERTAINMENT & SHOWS/Gemini_Generated_Image_xkqfy0xkqfy0xkqf.png' },
  ];
  
  const showsToSave: Partial<Show>[] = [];
  for (const cruise of cruises) {
    const matchedShows = showDefs.filter(s => s.ship.name === cruise.ship.name);
    for (let night = 0; night < 2; night++) {
      const showDate = new Date(cruise.departureDate);
      showDate.setDate(showDate.getDate() + night);
      matchedShows.forEach((show) => {
        showsToSave.push({ ...show, cruise, showDate: new Date(showDate), startTime: '19:30', bookedCount: 0 });
      });
    }
  }
  await showRepo.save(showsToSave);
  console.log(`  ✓ Shows created`);

  // ── Casino Events ──────────────────────────────────────────────────────────
  const casinoRepo = ds.getRepository(CasinoEvent);
  const casinoDefs = [
    { ship: carnival, name: 'Slots Marathon', gameType: CasinoGameType.SLOTS_TOURNAMENT, minAge: 18, imageUrl: '/images/Gemini_Generated_Image_7cali27cali27cal.png' },
    { ship: royalCaribbean, name: 'VIP Poker', gameType: CasinoGameType.POKER, minAge: 21, imageUrl: '/images/IMG-20260326-WA0001.jpg' },
    { ship: princess, name: 'Beginner Roulette', gameType: CasinoGameType.ROULETTE, minAge: 18, imageUrl: '/images/Gemini_Generated_Image_xa2pd5xa2pd5xa2p.png' },
    { ship: carnival, name: 'Baccarat Royal', gameType: CasinoGameType.BACCARAT, minAge: 21, imageUrl: '/images/IMG-20260326-WA0000.jpg' },
    { ship: royalCaribbean, name: 'High Roller Blackjack', gameType: CasinoGameType.BLACKJACK, minAge: 21, imageUrl: '/images/IMG-20260326-WA0003.jpg' },
    { ship: princess, name: 'Craps Tournament', gameType: CasinoGameType.ROULETTE, minAge: 18, imageUrl: '/images/IMG-20260326-WA0004.jpg' },
    { ship: carnival, name: 'Texas Holdem Main Event', gameType: CasinoGameType.POKER, minAge: 21, imageUrl: '/images/IMG-20260326-WA0005.jpg' },
    { ship: royalCaribbean, name: 'Late Night Slots', gameType: CasinoGameType.SLOTS_TOURNAMENT, minAge: 18, imageUrl: '/images/Gemini_Generated_Image_7cali27cali27cal.png' },
    { ship: princess, name: 'VIP Baccarat Room', gameType: CasinoGameType.BACCARAT, minAge: 21, imageUrl: '/images/IMG-20260326-WA0000.jpg' },
  ];
  const casinoToSave: Partial<CasinoEvent>[] = [];
  for (const cruise of cruises) {
    const matchedCasinos = casinoDefs.filter(s => s.ship.name === cruise.ship.name);
    matchedCasinos.forEach(def => {
      casinoToSave.push({
        ...def, cruise, eventDate: new Date(cruise.departureDate), startTime: '21:00', durationMinutes: 120, capacity: 50, bookedCount: 0,
      });
    });
  }
  await casinoRepo.save(casinoToSave);
  console.log(`  ✓ Casino events created`);

  // ── Packages (Trips) ───────────────────────────────────────────────────────
  const packageRepo = ds.getRepository(Package);
  const packageMap = {
    'Carnival Cruise Line': [
      { id: 'CARN-1', title: 'Fun Getaway', price: 1200, durationDays: 3, image: 'https://loremflickr.com/1600/900/cruise,ship,exterior?lock=1' },
      { id: 'CARN-2', title: 'Family Fun Pack', price: 1400, durationDays: 5, image: 'https://loremflickr.com/1600/900/vacation,family?lock=2' },
      { id: 'CARN-3', title: 'Luxury Escape', price: 1800, durationDays: 7, image: 'https://loremflickr.com/1600/900/luxury,cruise?lock=3' },
    ],
    'Royal Caribbean International': [
      { id: 'RC-1', title: 'Ocean Adventure', price: 1300, durationDays: 3, image: 'https://loremflickr.com/1600/900/ocean,adventure?lock=4' },
      { id: 'RC-2', title: 'Premium Voyage', price: 1500, durationDays: 5, image: 'https://loremflickr.com/1600/900/premium,travel?lock=5' },
      { id: 'RC-3', title: 'Ultimate Luxury', price: 2000, durationDays: 7, image: 'https://loremflickr.com/1600/900/luxury,yacht?lock=6' },
    ],
    'Princess Cruises': [
      { id: 'PR-1', title: 'Classic Sail', price: 1100, durationDays: 3, image: 'https://loremflickr.com/1600/900/sail,boat?lock=7' },
      { id: 'PR-2', title: 'Romantic Escape', price: 1600, durationDays: 5, image: 'https://loremflickr.com/1600/900/romantic,sunset,ocean?lock=8' },
      { id: 'PR-3', title: 'Elite Experience', price: 2200, durationDays: 7, image: 'https://loremflickr.com/1600/900/elite,travel?lock=9' },
    ]
  };

  for (const cruise of cruises) {
    const pkgDefs = packageMap[cruise.ship.name as keyof typeof packageMap];
    if (pkgDefs) {
      const pkgsToSave = pkgDefs.map(def => packageRepo.create({
        cruise,
        title: def.title,
        durationDays: def.durationDays,
        price: def.price,
        images: [def.image],
        facilities: ['SkyRide', 'Pool Access', 'Buffet Meals'],
        itinerary: [
          { day: 1, title: 'Boarding', desc: 'Welcome party' },
          { day: Math.ceil(def.durationDays/2), title: 'Sea Day', desc: 'Full ship access' },
          { day: def.durationDays, title: 'Departure', desc: 'Port arrival' }
        ]
      }));
      await packageRepo.save(pkgsToSave);
    }
  }
  console.log(`  ✓ Packages generated for all cruises`);

  await ds.destroy();
  console.log('\n✅ Seed complete! Your database is ready for demo.');
}

seed().catch((e) => { console.error(e); process.exit(1); });
