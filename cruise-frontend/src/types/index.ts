export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'guest' | 'admin';
  phone?: string;
  dob?: string;
  marketingConsent: boolean;
  createdAt: string;
}

export interface Port {
  id: string;
  name: string;
  city: string;
  country: string;
  countryCode?: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  description?: string;
}

export interface Ship {
  id: string;
  name: string;
  totalRooms: number;
  passengerCapacity: number;
  decks: number;
  description?: string;
  imageUrl?: string;
  amenities: string[];
  yearBuilt?: number;
}

export interface Cruise {
  id: string;
  name: string;
  ship: Ship;
  departurePort: Port;
  destinationPort: Port;
  departureDate: string;
  returnDate: string;
  durationNights: number;
  basePriceInside: number;
  basePriceOceanView: number;
  basePriceBalcony: number;
  basePriceSuite: number;
  status: 'active' | 'cancelled' | 'completed';
  description?: string;
  highlights: string[];
  imageUrl?: string;
  portsOfCall: string[];
}

export interface Room {
  id: string;
  ship: Ship;
  roomNumber: string;
  deck: number;
  type: 'inside' | 'ocean_view' | 'balcony' | 'suite';
  maxOccupancy: number;
  sizeSqft?: number;
  status: 'available' | 'maintenance' | 'holdback';
  amenities: string[];
  imageUrl?: string;
}

export interface Restaurant {
  id: string;
  ship: Ship;
  name: string;
  cuisine?: string;
  dressCode?: string;
  description?: string;
  imageUrl?: string;
}

export interface RestaurantSlot {
  id: string;
  restaurant: Restaurant;
  cruise: { id: string };
  mealSlot: 'breakfast' | 'lunch' | 'dinner' | 'special_tasting';
  slotDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
}

export interface Show {
  id: string;
  name: string;
  venue?: string;
  description?: string;
  showDate: string;
  startTime: string;
  durationMinutes: number;
  capacity: number;
  bookedCount: number;
  ageRestriction?: number;
  imageUrl?: string;
  genre?: string;
}

export interface CasinoEvent {
  id: string;
  name: string;
  gameType: string;
  eventDate: string;
  startTime: string;
  durationMinutes: number;
  capacity: number;
  bookedCount: number;
  minAge: number;
  skillLevel?: string;
  buyInUsd?: number;
  description?: string;
  imageUrl?: string;
}

export interface BookingItem {
  id: string;
  itemType: 'restaurant_slot' | 'show' | 'casino_event';
  itemId: string;
  itemName: string;
  activityDate: string;
  startTime: string;
  endTime: string;
}

export interface Package {
  id: string;
  title: string;
  description: string;
  price: number;
  durationDays: number;
  images: string[];
  facilities: string[];
  itinerary: { day: number; title: string; desc: string }[];
  createdAt: string;
}

export interface Booking {
  id: string;
  bookingReference: string;
  cruise: Cruise;
  room: Room;
  status: 'confirmed' | 'pending' | 'cancelled';
  totalPrice: number;
  guestCount: number;
  specialRequests?: string;
  items: BookingItem[];
  createdAt: string;
}
