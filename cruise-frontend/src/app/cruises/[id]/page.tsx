'use client';
import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Grid, Button, Chip, Stack,
  Card, CardContent, CardMedia, Divider, Skeleton, Paper, Avatar, Rating
} from '@mui/material';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import WifiIcon from '@mui/icons-material/Wifi';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import CircleIcon from '@mui/icons-material/Circle';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { cruisesApi, packagesApi, roomsApi } from '@/lib/api';
import { Cruise, Package, Room } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import Alert from '@mui/material/Alert';

// Image sets for different regions to ensure variety
const destinationImages: Record<string, string[]> = {
  'Caribbean': ['/images/IMG-20260326-WA0007.jpg', '/images/IMG-20260326-WA0000.jpg', '/images/IMG-20260326-WA0003.jpg', '/images/IMG-20260326-WA0024.jpg'],
  'Europe': ['/images/IMG-20260326-WA0010.jpg', '/images/IMG-20260326-WA0009.jpg', '/images/IMG-20260326-WA0014.jpg', '/images/IMG-20260326-WA0023.jpg'],
  'Asia': ['/images/IMG-20260326-WA0012.jpg', '/images/IMG-20260326-WA0022.jpg', '/images/IMG-20260326-WA0026.jpg', '/images/IMG-20260326-WA0027.jpg'],
  'Mediterranean': ['/images/IMG-20260326-WA0010.jpg', '/images/IMG-20260326-WA0015.jpg', '/images/IMG-20260326-WA0021.jpg', '/images/IMG-20260326-WA0029.jpg'],
  'Default': ['/images/IMG-20260326-WA0006.jpg', '/images/IMG-20260326-WA0008.jpg', '/images/freepik_create-a-series-of-ultrahighreso_5.png', '/images/freepik_create-a-series-of-ultrahighreso_6.png']
};

/**
 * Dynamically generates an itinerary based on cruise data.
 */
function generateItinerary(cruise: Cruise) {
  const ports = cruise.portsOfCall || [];
  const highlights = cruise.highlights || [];
  const duration = cruise.durationNights || 5;
  const itinerary = [];

  // Day 1: Embarkation
  itinerary.push({ 
    day: 1, 
    title: `Embarkation at ${cruise.departurePort?.name || 'Home Port'}`, 
    desc: 'Welcome aboard! Settle into your cabin, explore the ship, and join us for the grand sail-away party on the pool deck.' 
  });

  // Calculate where to put ports
  const midDaysCount = duration - 2; // Days between first and last
  const portInterval = midDaysCount > 0 ? Math.max(1, Math.floor(midDaysCount / Math.max(1, ports.length))) : 1;

  for (let day = 2; day < duration; day++) {
    const portIdx = Math.floor((day - 2) / portInterval);
    if (day % portInterval === 0 && ports[portIdx]) {
      itinerary.push({
        day,
        title: `Port of Call: ${ports[portIdx]}`,
        desc: highlights[portIdx] 
          ? `Discover the magic of ${ports[portIdx]}. Experience ${highlights[portIdx]} and local culture.` 
          : `Enjoy a full day exploring ${ports[portIdx]} with its unique sights and optional local excursions.`
      });
    } else {
      itinerary.push({
        day,
        title: 'Cruising at Sea',
        desc: 'Relax by the pool, enjoy world-class dining, or indulge in a spa treatment as we sail towards our next destination.'
      });
    }
  }

  // Final Day: Disembarkation
  itinerary.push({ 
    day: duration, 
    title: `Arrival at ${cruise.destinationPort?.name || 'Final Port'}`, 
    desc: 'Enjoy a final breakfast on board before disembarking with unforgettable memories of your journey.' 
  });

  return itinerary;
}

// Dynamically return ship amenities based on the selected cruise line
function getShipAmenities(shipName: string) {
  if (shipName.includes('Carnival')) {
    return {
      events: ['Comedy shows & stand-up', 'Karaoke & themed parties', 'Live music & dance clubs', 'Deck parties & poolside games', 'Broadway-style shows (varies)'],
      bars: ['Poolside bars', 'Cocktail lounges', 'Sports bars', 'Nightclubs with DJs'],
      casino: ['"Casino Carnival"', '100+ slot machines', 'Blackjack, poker, roulette', 'Open in international waters'],
      offShip: ['Beach tours', 'Snorkeling & scuba diving', 'Cultural city tours', 'Adventure sports (zipline, ATV)']
    };
  }
  if (shipName.includes('Royal Caribbean')) {
    return {
      events: ['Ice skating shows', 'Surf simulator (FlowRider)', 'Aqua theater shows', 'Broadway musicals', 'Adventure activities (rock climbing)'],
      bars: ['Bionic Bar (robot bartenders)', 'Sky bars & lounges', 'Wine bars', 'English pubs'],
      casino: ['"Casino Royale"', 'Poker tournaments', 'VIP gaming rooms', 'Open at sea only'],
      offShip: ['Glacier tours (Alaska)', 'European city tours', 'Perfect Day at CocoCay', 'Desert safaris']
    };
  }
  // Default to Princess
  return {
    events: ['"Movies Under the Stars"', 'Live orchestras & music', 'Dance classes', 'Game shows & quizzes'],
    bars: ['Wine bars', 'Jazz lounges', 'Pool bars', 'Premium cocktail bars'],
    casino: ['One of the best cruise casinos', 'Slots, video poker, & table games', 'Beginner-friendly lessons'],
    offShip: ['Wine tours (Europe)', 'Wildlife tours', 'Historical sightseeing', 'Island hopping']
  };
}

export default function CruiseDetailPage() {
  const { id } = useParams();
  const [cruise, setCruise] = useState<Cruise | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Gallery images setup
  const getGalleryImages = () => {
    if (!cruise) return destinationImages['Default'];
    const dest = cruise.name.includes('Caribbean') ? 'Caribbean' :
                 cruise.name.includes('Asian') ? 'Asia' :
                 cruise.name.includes('Mediterranean') ? 'Mediterranean' :
                 cruise.name.includes('Explorer') ? 'Europe' : 'Default';
    
    const baseSet = destinationImages[dest] || destinationImages['Default'];
    // Put the cruise's own main image first
    return [cruise.imageUrl, ...baseSet.slice(0, 3)];
  };

  const galleryImages = getGalleryImages();
  const [activeImage, setActiveImage] = useState(galleryImages[0]);

  useEffect(() => {
    Promise.all([
      cruisesApi.getOne(id as string),
      packagesApi.getByCruise(id as string)
    ]).then(([c, pkgs]) => {
      setCruise(c);
      setPackages(pkgs);
      
      const dest = c.name.includes('Caribbean') ? 'Caribbean' :
                   c.name.includes('Asian') ? 'Asia' :
                   c.name.includes('Mediterranean') ? 'Mediterranean' :
                   c.name.includes('Explorer') ? 'Europe' : 'Default';
      
      const baseSet = destinationImages[dest] || destinationImages['Default'];
      setActiveImage(c.imageUrl || baseSet[0]);

      return roomsApi.getByShip(c.ship.id);
    }).then(r => {
      if (r) setRooms(r);
      setLoading(false);
    }).catch(console.error);
  }, [id]);

  if (loading) return <Container sx={{ py: 8 }}><Skeleton variant="rectangular" height={500} /></Container>;
  if (!cruise) return <Container sx={{ py: 8 }}><Typography variant="h5">Cruise not found.</Typography></Container>;

  const itinerary = generateItinerary(cruise);
  const shipAmenities = getShipAmenities(cruise.ship.name || '');

  // Prices
  const basePriceInside = Number(cruise.basePriceInside || (cruise as any).price || 399);
  const basePriceOceanView = Number((cruise as any).basePriceOceanView) || basePriceInside + 200;
  const basePriceBalcony = Number((cruise as any).basePriceBalcony) || basePriceInside + 400;
  const basePriceSuite = Number((cruise as any).basePriceSuite) || basePriceInside + 1000;

  return (
    <Box sx={{ bgcolor: 'background.default', pb: 8 }}>
      
      {/* 1. IMAGE GALLERY */}
      <Box sx={{ bgcolor: '#111', pt: { xs: 8, md: 10 }, pb: 4 }}>
        <Container maxWidth="xl">
          <Grid container spacing={2}>
            {/* Main Image */}
            <Grid item xs={12} md={8}>
              <Box sx={{ height: { xs: 300, md: 500 }, borderRadius: 3, overflow: 'hidden' }}>
                <Box component="img" src={activeImage} alt={cruise.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </Box>
            </Grid>
            {/* Thumbnails */}
            <Grid item xs={12} md={4}>
              <Grid container spacing={2} sx={{ height: '100%' }}>
                {galleryImages.slice(1, 4).map((img, idx) => (
                  <Grid item xs={4} md={12} key={idx} sx={{ height: { xs: 120, md: 'calc(500px / 3 - 11px)' } }}>
                    <Box 
                      component="img" src={img} onClick={() => setActiveImage(img)}
                      sx={{ 
                        width: '100%', height: '100%', objectFit: 'cover', 
                        borderRadius: 3, cursor: 'pointer', 
                        aspectRatio: '1/1',
                        opacity: activeImage === img ? 1 : 0.6, 
                        boxShadow: activeImage === img ? '0 0 0 3px #1976d2' : 'none',
                        '&:hover': { opacity: 1 }, transition: 'all 0.2s' 
                      }} 
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>

          {/* Title Area beneath gallery */}
          <Box sx={{ mt: 4, color: 'white' }}>
            <Typography variant="h3" fontWeight={800} mb={1}>{cruise.name}</Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap" rowGap={1}>
              <Chip label={`${cruise.durationNights || 5} Nights`} sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 700 }} />
              <Chip label={cruise.ship.name || 'Luxury Liner'} icon={<DirectionsBoatIcon />} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
              <Stack direction="row" spacing={0.5} alignItems="center">
                <LocationOnIcon color="primary" />
                <Typography>{cruise.departurePort?.name || 'Miami'} → {cruise.destinationPort?.name || 'Bahamas'}</Typography>
              </Stack>
            </Stack>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Grid container spacing={4}>
          
          {/* Left Content Column */}
          <Grid item xs={12} md={8}>
            
            {/* Description */}
            <Paper sx={{ p: 4, borderRadius: 3, mb: 4 }}>
              <Typography variant="h5" fontWeight={700} mb={2}>Overview</Typography>
              <Typography variant="body1" color="text.secondary" lineHeight={1.8}>
                {cruise.description || "Experience the ultimate getaway onboard our state-of-the-art cruise ships. Whether you're looking for family fun, romantic sunsets, or thrilling adventures at port, this cruise offers something for everyone."}
              </Typography>
            </Paper>

            {/* Cabin Types */}
            <Paper sx={{ p: 4, borderRadius: 3, mb: 4 }}>
              <Typography variant="h5" fontWeight={700} mb={3}>Cabin Details</Typography>
              <Grid container spacing={3}>
                {(['inside', 'ocean_view', 'balcony', 'suite']).map((type, idx) => {
                  const room = rooms.find(r => r.type === type);
                  if (!room) return null;
                  
                  const cabinInfo: Record<string, { title: string, desc: string }> = {
                    inside: { title: 'Interior', desc: 'Budget-friendly comfort with all modern amenities.' },
                    ocean_view: { title: 'Ocean View', desc: 'Wake up to beautiful ocean horizons every morning.' },
                    balcony: { title: 'Balcony', desc: 'Step outside and enjoy the sea breeze in private.' },
                    suite: { title: 'Suite', desc: 'Ultimate luxury, extra space, and premium perks.' }
                  };
                  
                  return (
                    <Grid item xs={12} sm={6} key={idx}>
                      <Card variant="outlined" sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <CardMedia component="img" height="200" image={room.imageUrl || '/images/default-room.jpg'} alt={cabinInfo[type].title} sx={{ objectFit: 'cover', objectPosition: 'center' }} />
                        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                           <Typography variant="h6" fontWeight={700} mb={1}>{cabinInfo[type].title}</Typography>
                           <Typography variant="body2" color="text.secondary" flexGrow={1}>{cabinInfo[type].desc}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Paper>

            {/* Packages (Trips) */}
            <Paper sx={{ p: 4, borderRadius: 3, mb: 4 }}>
              <Typography variant="h5" fontWeight={700} mb={3}>Available Packages (Trips)</Typography>
              <Grid container spacing={3}>
                {packages.map((pkg, idx) => (
                  <Grid item xs={12} md={4} key={idx}>
                    <Card variant="outlined" sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                      <CardMedia component="img" height="150" image={pkg.images[0]} alt={pkg.title} sx={{ objectFit: 'cover' }} />
                      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                         <Typography variant="h6" fontWeight={700} mb={0.5}>{pkg.title}</Typography>
                         <Typography variant="subtitle1" fontWeight={700} color="primary.main" mb={1}>From ${pkg.price}/pp</Typography>
                         <Typography variant="body2" color="text.secondary" mb={3} flexGrow={1}>{pkg.description}</Typography>
                         <Button variant="contained" component={Link} href={`/cruises/${cruise.id}/packages/${pkg.id}`} fullWidth>
                           View Package
                         </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* Ship Amenities */}
            <Paper sx={{ p: 4, borderRadius: 3, mb: 4 }}>
              <Typography variant="h5" fontWeight={700} mb={3}>Ship Amenities</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" fontWeight={700} mb={1} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><SportsEsportsIcon color="secondary"/> Onboard Events</Typography>
                  <Stack spacing={0.5}>{shipAmenities.events.map(a => <Typography variant="body2" key={a}>• {a}</Typography>)}</Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" fontWeight={700} mb={1} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><LocalBarIcon color="secondary"/> Bars & Lounges</Typography>
                  <Stack spacing={0.5}>{shipAmenities.bars.map(a => <Typography variant="body2" key={a}>• {a}</Typography>)}</Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" fontWeight={700} mb={1} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><CircleIcon color="secondary" sx={{fontSize: 18}}/> Casino</Typography>
                  <Stack spacing={0.5}>{shipAmenities.casino.map(a => <Typography variant="body2" key={a}>• {a}</Typography>)}</Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" fontWeight={700} mb={1} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><LocationOnIcon color="secondary"/> Excursions</Typography>
                  <Stack spacing={0.5}>{shipAmenities.offShip.map(a => <Typography variant="body2" key={a}>• {a}</Typography>)}</Stack>
                </Grid>
              </Grid>
            </Paper>
            
            {/* Reviews */}
            <Paper sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant="h5" fontWeight={700} mb={3}>Guest Reviews</Typography>
              <Stack spacing={3}>
                {[
                  { name: 'Sarah M.', date: 'May 2025', rating: 5, text: 'Absolutely breathtaking! The balcony room was worth every penny and the onboard events kept us entertained non-stop.' },
                  { name: 'John D.', date: 'April 2025', rating: 4.5, text: 'Great food, beautiful ports. The casino was surprisingly large and very fun. Will definitely sail again.' }
                ].map((rev, idx) => (
                  <Box key={idx}>
                    <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                       <Avatar sx={{ bgcolor: 'primary.main' }}>{rev.name[0]}</Avatar>
                       <Box>
                         <Typography variant="subtitle2" fontWeight={700}>{rev.name}</Typography>
                         <Typography variant="caption" color="text.secondary">{rev.date}</Typography>
                       </Box>
                       <Rating value={rev.rating} precision={0.5} readOnly size="small" sx={{ ml: 'auto' }} />
                    </Stack>
                    <Typography variant="body2">{rev.text}</Typography>
                    {idx === 0 && <Divider sx={{ my: 2 }} />}
                  </Box>
                ))}
              </Stack>
            </Paper>

          </Grid>

          {/* Right Content Column (Pricing & CTA) */}
          <Grid item xs={12} md={4}>
            <Card sx={{ position: 'sticky', top: 100, borderRadius: 3, boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" fontWeight={800} mb={1}>Pricing Breakdown</Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>Select your cabin type in the next step to finalize your booking.</Typography>
                
                <Stack spacing={2} mb={3}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Interior Room</Typography>
                    <Typography fontWeight={700}>${basePriceInside} /pp</Typography>
                  </Box>
                  <Divider />
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Ocean View</Typography>
                    <Typography fontWeight={700}>${basePriceOceanView} /pp</Typography>
                  </Box>
                  <Divider />
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Balcony</Typography>
                    <Typography fontWeight={700}>${basePriceBalcony} /pp</Typography>
                  </Box>
                  <Divider />
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Luxury Suite</Typography>
                    <Typography fontWeight={700}>${basePriceSuite} /pp</Typography>
                  </Box>
                </Stack>

                <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 2, mb: 3 }}>
                  <Typography variant="subtitle2" display="flex" alignItems="center" gap={1}>
                    <CheckCircleIcon color="success" fontSize="small" /> Free cancellation up to 30 days
                  </Typography>
                  <Typography variant="subtitle2" display="flex" alignItems="center" gap={1} mt={1}>
                    <CheckCircleIcon color="success" fontSize="small" /> Meals and entertainment included
                  </Typography>
                </Box>

                {isAdmin && (
                  <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
                    <Typography variant="caption" fontWeight={600}>
                      Admins cannot create bookings. Please use a guest account.
                    </Typography>
                  </Alert>
                )}

                <Button
                  fullWidth variant="contained" size="large"
                  component={Link} href={`/booking/${cruise.id}`}
                  disabled={isAdmin}
                  endIcon={<ArrowForwardIcon />} sx={{ py: 1.8, fontSize: '1.1rem', fontWeight: 700 }}>
                  {isAdmin ? 'Booking Restricted' : 'Global Booking'}
                </Button>
              </CardContent>
            </Card>
          </Grid>

        </Grid>
      </Container>
    </Box>
  );
}
