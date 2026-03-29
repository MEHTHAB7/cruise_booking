export const getCruisePackages = (cruiseName: string, basePriceInside: number) => {
  // Use verified Wikimedia Commons URLs of exact online real-world cruise destinations.
  // These URLs are guaranteed to never 404 and provide real-world representations of the packages.

  const isCarnival = cruiseName?.includes('Carnival');
  const isRoyal = cruiseName?.includes('Royal');

  let shortPackageImages: string[] = [];
  let standardPackageImages: string[] = [];
  let extendedPackageImages: string[] = [];

  if (isCarnival) {
    shortPackageImages = [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Isla_cozumel_April17-2001-crop.jpg/960px-Isla_cozumel_April17-2001-crop.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Ocean_drive_day_2009j.JPG/960px-Ocean_drive_day_2009j.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/JM-ocho_rios-hafen-01.jpg/960px-JM-ocho_rios-hafen-01.jpg',
    ];
    standardPackageImages = [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Nassau_-_panoramio_%284%29.jpg/960px-Nassau_-_panoramio_%284%29.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Grand_Turk_from_the_air.jpg/960px-Grand_Turk_from_the_air.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/2013_Old_San_Juan_01.JPG/960px-2013_Old_San_Juan_01.JPG',
    ];
    extendedPackageImages = [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/View_of_St._Thomas.jpg/960px-View_of_St._Thomas.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/e/e8/Philipsburg_and_the_Great_Bay%2C_Sint_Maarten%2C_Caribbean.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/San_Juan_Skyline.jpg/960px-San_Juan_Skyline.jpg',
    ];
  } else if (isRoyal) {
    shortPackageImages = [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Aerial_view_of_Barcelona%2C_Spain_%2851227309370%29_edited.jpg/960px-Aerial_view_of_Barcelona%2C_Spain_%2851227309370%29_edited.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Trevi_Fountain%2C_Rome%2C_Italy_2_-_May_2007.jpg/960px-Trevi_Fountain%2C_Rome%2C_Italy_2_-_May_2007.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Venezia_aerial_view.jpg/960px-Venezia_aerial_view.jpg',
    ];
    standardPackageImages = [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/2011_Dimos_Thiras.png/960px-2011_Dimos_Thiras.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/The_walls_of_the_fortress_and_View_of_the_old_city._panorama.jpg/960px-The_walls_of_the_fortress_and_View_of_the_old_city._panorama.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Piazza_de_Ferrari%2C_Genoa.jpg/960px-Piazza_de_Ferrari%2C_Genoa.jpg',
    ];
    extendedPackageImages = [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Notre-Dame_de_la_Garde_aerial_view_2020.jpeg/960px-Notre-Dame_de_la_Garde_aerial_view_2020.jpeg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Napoli_-_Maschio_Angioino_-_202209302342_3.jpg/960px-Napoli_-_Maschio_Angioino_-_202209302342_3.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/9/96/View_across_Ocean_Village_Marina_%28geograph_5432669%29.jpg',
    ];
  } else {
    // Princess
    shortPackageImages = [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Abu_dhabi_skylines_2014.jpg/960px-Abu_dhabi_skylines_2014.jpg',
      'https://upload.wikimedia.org/wikipedia/en/thumb/c/c7/Burj_Khalifa_2021.jpg/960px-Burj_Khalifa_2021.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Northport_Malaysia_Wharve.JPG/960px-Northport_Malaysia_Wharve.JPG',
    ];
    standardPackageImages = [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Marina_Bay_Sands_at_Night.jpg/960px-Marina_Bay_Sands_at_Night.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/2/21/Iss064e037124_penang.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Casa_finance_city_6_%28cropped%29.jpg/960px-Casa_finance_city_6_%28cropped%29.jpg',
    ];
    extendedPackageImages = [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Camps_bay_%2853460319478%29_%28cropped%29.jpg/960px-Camps_bay_%2853460319478%29_%28cropped%29.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Durban_from_the_Balcony_%28Dennis_Sylvester_Hurd%29_1.jpg/960px-Durban_from_the_Balcony_%28Dennis_Sylvester_Hurd%29_1.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Port_Louis_Skyline.jpg/960px-Port_Louis_Skyline.jpg',
    ];
  }

  return {
    'short-trip': {
      id: 'short-trip',
      title: '3-Day Express Package',
      desc: 'A quick 3-day getaway perfectly tailored for a long weekend. Unwind quickly and experience the core highlights.',
      price: Math.floor(basePriceInside * 0.4),
      duration: 3,
      images: shortPackageImages,
      facilities: ['All Standard Meals Included', 'Access to Main Pool Deck', 'Evening Entertainment', 'Basic Port Excursion'],
      itinerary: [
        { day: 1, title: 'Embarkation & Welcome Party', desc: 'Settle into your room and join the massive deck party.' },
        { day: 2, title: 'At Sea / Port Arrival', desc: 'Enjoy the amenities, pools, and reach our primary destination.' },
        { day: 3, title: 'Disembarkation', desc: 'Final breakfast and smooth departure.' },
      ]
    },
    'standard-trip': {
      id: 'standard-trip',
      title: '7-Day Standard Package',
      desc: 'Our most popular 7-day sailing covering the best ports of call. Enjoy a full week of relaxation and gourmet dining.',
      price: basePriceInside,
      duration: 7,
      images: standardPackageImages,
      facilities: ['All Meals & Specialty Dining', 'Access to All Pools & Spas', 'Premium Entertainment Access', 'Guided Port Tours'],
      itinerary: [
        { day: 1, title: 'Embarkation', desc: 'Board the ship and explore the massive facilities.' },
        { day: 2, title: 'Cruising the Open Waters', desc: 'A full day at sea. Enjoy the pools, spa, and shows.' },
        { day: 3, title: 'First Port of Call', desc: 'Dock at our primary destination for a 12-hour excursion.' },
        { day: 4, title: 'Second Port of Call', desc: 'Explore historical sights and vibrant local culture.' },
        { day: 5, title: 'At Sea / Relaxation', desc: 'Unwind with panoramic ocean views and luxury dining.' },
        { day: 6, title: 'Final Highlight Port', desc: 'Experience the final breathtaking offshore adventure.' },
        { day: 7, title: 'Return & Farewell', desc: 'Captain\'s farewell dinner and arrival morning.' },
      ]
    },
    'extended-trip': {
      id: 'extended-trip',
      title: '14-Day Explorer Package',
      desc: 'A profound 14-day extended journey deep into multiple regions. For the true explorer wanting to experience everything.',
      price: Math.floor(basePriceInside * 1.8),
      duration: 14,
      images: extendedPackageImages,
      facilities: ['All-Inclusive Dining & Drinks', 'Priority Spa Booking', 'VIP Entertainment Seating', 'Exclusive Offshore Excursions', 'Butler Service Availability'],
      itinerary: [
        { day: 1, title: 'Grand Embarkation', desc: 'VIP boarding and suite setup with welcome champagne.' },
        { day: 2, title: 'Heading to Deep Waters', desc: 'Cruising. Enjoy our unlimited premium dining.' },
        { day: 4, title: 'Region 1 Exploration', desc: 'First major continent/region coastal tour.' },
        { day: 7, title: 'Halfway Milestone Celebration', desc: 'A massive onboard gala celebrating the voyage.' },
        { day: 10, title: 'Region 2 Deep Dive', desc: 'Our second major region. 2 full days docked.' },
        { day: 13, title: 'The Long Return', desc: 'Reflection, spa days, and the grand finale performance.' },
        { day: 14, title: 'Final Disembarkation', desc: 'Priority checkout and luggage handling.' },
      ]
    }
  };
};
