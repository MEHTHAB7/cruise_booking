import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Package } from '../packages/entities/package.entity';
import { Cruise } from '../cruises/entities/cruise.entity';
import { Ship } from '../ships/entities/ship.entity';
import { Port } from '../ports/entities/port.entity';
import { Room } from '../rooms/entities/room.entity';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '250730',
  database: process.env.DB_NAME || 'cruise_booking',
  entities: [Package, Cruise, Ship, Port, Room],
  synchronize: false,
});

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected.');

    const cruiseRepo = AppDataSource.getRepository(Cruise);
    const packageRepo = AppDataSource.getRepository(Package);

    // 🛑 CLEAR OLD DATA FIRST
    console.log('Clearing existing packages...');
    await packageRepo.createQueryBuilder().delete().from(Package).execute();

    const cruises = await cruiseRepo.find();
    console.log(`Found ${cruises.length} cruises to seed.`);

    for (const cruise of cruises) {
      const name = cruise.name;
      console.log(`Building unique packages for: ${name}...`);
      
      const isCarnival = name.includes('Carnival');
      const isRoyal = name.includes('Royal');
      const destName = isCarnival ? 'Morocco' : isRoyal ? 'Bahamas' : 'Mexico';
      const localImg = isCarnival ? '/images/morocco.png' : isRoyal ? '/images/bahamas.png' : '/images/mexico.png';

      // 🖼️ UPDATE CRUISE MAIN IMAGE
      await cruiseRepo.update(cruise.id, { imageUrl: localImg });

      // 🕒 3-Day Packages (UNIQUE)
      const isPrincess = name.includes('Princess');
      const pkg3 = packageRepo.create({
        cruise,
        title: `${name} 3-Day Express`,
        description: `A fast-paced, high-energy ${destName} escape for those who want to see it all in a weekend.`,
        durationDays: 3,
        price: isRoyal ? 549 : 449,
        images: [localImg],
        facilities: isCarnival ? ['Water Slides', 'SkyRide', 'IMAX'] : ['Rock Climbing', 'FlowRider', 'Central Park'],
        itinerary: [
          { day: 1, title: `Boarding in ${destName}`, desc: 'Start your mini-vacation with a sunset cocktail on the top deck.' },
          { day: 2, title: `${destName} Highlights`, desc: 'Our fast-track tour of the most iconic local landmarks.' },
          { day: 3, title: 'Return Journey', desc: 'A quick morning loop back to base with a farewell brunch.' }
        ]
      });

      // 🕒 5-Day Packages (NEW)
      const pkg5 = packageRepo.create({
        cruise,
        title: `${name} 5-Day ${isPrincess ? 'Heritage' : 'Spice'} Explorer`,
        description: `The perfect 5-day balance. Dive deeper into the ${destName} culture without the full week commitment.`,
        durationDays: 5,
        price: 850,
        images: [localImg],
        facilities: isRoyal ? ['H2O Zone', 'RipCord', 'North Star'] : ['Evening Movies under the Stars', 'Lotus Spa', 'Sanctuary'],
        itinerary: [
          { day: 1, title: 'Grand Departure', desc: 'Settle into your cabin and join the sail-away toast.' },
          { day: 2, title: 'Coastal Discovery', desc: 'Scenic cruising along the most beautiful reaches of the coast.' },
          { day: 3, title: 'In-Depth Port Tour', desc: 'A full day of curated local excursions and shore activities.' },
          { day: 4, title: 'Leisure & Luxury', desc: 'Enjoy full access to our premium onboard spa and entertainment.' },
          { day: 5, title: 'Smooth Return', desc: 'Final morning views and traditional farewell breakfast.' }
        ]
      });

      // 🕒 7-Day Packages (UNIQUE)
      const itinerary7 = isPrincess ? [
        { day: 1, title: 'Check-in & Relaxation', desc: 'Indulge in a signature massage as we set sail.' },
        { day: 3, title: 'Wine Tasting at Sea', desc: 'Explore the world of luxury wines with our sommelier.' },
        { day: 5, title: 'Traditional Tea Ceremony', desc: 'A peaceful afternoon ceremony in the traditional lounge.' },
        { day: 7, title: 'Grand Arrival', desc: 'Disembark after a week of pure serenity.' }
      ] : [
        { day: 1, title: 'Epic Departure', desc: 'Our most energetic departure party ever.' },
        { day: 3, title: 'Adrenaline Day', desc: 'Full-day access to the onboard sports and thrill facilities.' },
        { day: 5, title: 'Island Adventure', desc: 'Jet-skiing and jungle exploration at our mystery port.' },
        { day: 7, title: 'The Grand Finale', desc: 'Pyrotechnic show and a midnight themed buffet.' }
      ];

      const pkg7 = packageRepo.create({
        cruise,
        title: `${name} 7-Day ${isPrincess ? 'Sapphire' : 'Adventure'} Edition`,
        description: `A comprehensive 7-day journey through ${destName}. The ultimate balance of adventure and luxury.`,
        durationDays: 7,
        price: 1199.00 + (Math.random() * 200),
        images: [localImg],
        facilities: ['Chef Table Access', 'VIP Theater Seats', 'Guided Tour Pass'],
        itinerary: itinerary7
      });

      // 🕒 15-Day Packages (UNIQUE)
      const pkg15 = packageRepo.create({
        cruise,
        title: `${name} 15-Day Grand Odyssey`,
        description: `The voyage of a lifetime. A 15-day in-depth exploration of the entire ${destName} region.`,
        durationDays: 15,
        price: 2499.00 + (Math.random() * 500),
        images: [localImg],
        facilities: isPrincess ? ['Butler Service', 'Personalized Menu', 'Luxury Suite Only'] : ['Exclusive Shore Excursions', 'All-Access Pass', 'Personal Concierge'],
        itinerary: [
          { day: 1, title: 'The Long Journey Begins', desc: 'VIP orientation and first-class dinner.' },
          { day: 5, title: 'Deep Ocean Crossing', desc: 'Specialized onboard lectures and educational events.' },
          { day: 8, title: 'Hidden Gems of ' + destName, desc: 'Exploring ports only accessible by smaller vessels.' },
          { day: 12, title: 'Grand Celebration Night', desc: 'Our most prestigious formal night with live orchestra.' },
          { day: 15, title: 'Ultimate Return', desc: 'Final gift and certificates ceremony before disembarking.' }
        ]
      });

      await packageRepo.save([pkg3, pkg5, pkg7, pkg15]);
      console.log(`Saved 4 unique packages for cruise ID ${cruise.id}.`);
    }

    console.log('Seeding completed successfully with unique data.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
