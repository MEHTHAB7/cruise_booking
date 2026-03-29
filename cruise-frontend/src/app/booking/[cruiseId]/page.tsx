'use client';

import React, { useState, useEffect, Suspense } from 'react';
import {
  Box, Container, Stepper, Step, StepLabel, Typography, Button,
  Grid, Card, CardContent, Radio, RadioGroup, FormControlLabel,
  TextField, Slider, Chip, Stack, Alert, Paper, Divider, Skeleton, CircularProgress, MenuItem, CardMedia
} from '@mui/material';
import HotelIcon from '@mui/icons-material/Hotel';
import GroupIcon from '@mui/icons-material/Group';
import ExtensionIcon from '@mui/icons-material/Extension';
import PaymentIcon from '@mui/icons-material/Payment';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import TheaterComedyIcon from '@mui/icons-material/TheaterComedy';
import CasinoIcon from '@mui/icons-material/Casino';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExploreIcon from '@mui/icons-material/Explore';
import WifiIcon from '@mui/icons-material/Wifi';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { cruisesApi, roomsApi, restaurantsApi, showsApi, casinoApi, bookingsApi, packagesApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useSnackbar } from 'notistack';
import { Cruise, Room, RestaurantSlot, Show, CasinoEvent, Booking, Package } from '@/types';

const steps = ['Select Package', 'Choose Cabin', 'Passenger Details', 'Add Extras', 'Payment Summary'];

const roomTypeLabel: Record<string, string> = {
  inside: 'Inside', ocean_view: 'Ocean View', balcony: 'Balcony', suite: 'Suite',
};

function BookingPageContent() {
  const { cruiseId } = useParams();
  const searchParams = useSearchParams();
  const userPackageId = searchParams.get('packageId');

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [step, setStep] = useState(0);

  // Data
  const [cruise, setCruise] = useState<Cruise | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [slots, setSlots] = useState<RestaurantSlot[]>([]);
  const [shows, setShows] = useState<Show[]>([]);
  const [casinoEvents, setCasinoEvents] = useState<CasinoEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  // Package Management
  const [packagesData, setPackagesData] = useState<Package[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);

  // Step 1: Cabin Selection
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [guestCount, setGuestCount] = useState(2);

  // Step 2: Passenger Details
  const [passengers, setPassengers] = useState([{ name: '', email: '' }, { name: '', email: '' }]);

  // Step 3: Extras
  const [selectedWifi, setSelectedWifi] = useState<string>('none');
  const [bookedItemIds, setBookedItemIds] = useState<Set<string>>(new Set());
  const [addingActivity, setAddingActivity] = useState<string | null>(null);

  // Step 4: Payment Summary
  const [booking, setBooking] = useState<Booking | null>(null);
  const [specialRequests, setSpecialRequests] = useState('');

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user?.role === 'admin') {
      enqueueSnackbar('Admins cannot create bookings. Please use a guest account.', { variant: 'warning' });
      router.push('/');
      return;
    }
    if (!user) return;
    Promise.all([
      cruisesApi.getOne(cruiseId as string),
      restaurantsApi.getSlots(cruiseId as string),
      showsApi.getByCruise(cruiseId as string),
      casinoApi.getByCruise(cruiseId as string),
      packagesApi.getByCruise(cruiseId as string),
    ]).then(([c, s, sh, ce, pkgs]) => {
      setCruise(c);
      setSlots(s); setShows(sh); setCasinoEvents(ce);
      setPackagesData(pkgs);
      
      if (userPackageId) {
         const found = pkgs.find((p: Package) => p.id === userPackageId);
         if (found) {
           setSelectedPackageId(userPackageId);
           setStep(1); 
         }
      }

      return roomsApi.getByShip(c.ship.id);
    }).then(setRooms).catch((err) => {
      console.error(err);
      setErrorMsg(err.message || String(err));
    }).finally(() => setLoading(false));
  }, [cruiseId, user, authLoading, router, userPackageId]);

  // Adjust passenger array when guest count changes
  useEffect(() => {
    setPassengers(prev => {
      const arr = [...prev];
      if (guestCount > arr.length) {
        for (let i = arr.length; i < guestCount; i++) arr.push({ name: '', email: '' });
      } else {
        arr.splice(guestCount);
      }
      return arr;
    });
  }, [guestCount]);

  const pkg = selectedPackageId ? packagesData.find(p => p.id === selectedPackageId) : null;

  const priceForRoom = (room: Room) => {
    if (!cruise || !pkg) return 0;
    
    // Determine the room quality upgrade fee (diff between base DB inside and the chosen room DB price)
    const dbPrices: Record<string, number> = {
      inside: Number(cruise.basePriceInside), ocean_view: Number(cruise.basePriceOceanView),
      balcony: Number(cruise.basePriceBalcony), suite: Number(cruise.basePriceSuite),
    };
    const upgradeCost = dbPrices[room.type] - dbPrices['inside'];
    
    // Total is Package duration base price + the cabin premium
    const finalPerPerson = pkg.price + upgradeCost;
    return finalPerPerson * guestCount;
  };

  const handleCreateBooking = async () => {
    if (!selectedRoom || !cruise) return;
    setConfirming(true);
    try {
      const passengerNames = passengers.map((p, i) => `Guest ${i+1}: ${p.name} (${p.email})`).join(', ');
      const reqs = `Package: ${pkg?.title || 'Selected Package'}. Passengers: ${passengerNames}. ${specialRequests}`;
      const b = await bookingsApi.create({ cruiseId: cruise.id, roomId: selectedRoom.id, guestCount, specialRequests: reqs });
      setBooking(b);
      setStep(3); // Move to Extras
    } catch (err: any) {
      enqueueSnackbar(err.message || 'Error creating booking', { variant: 'error' });
    } finally {
      setConfirming(false);
    }
  };

  const handleAddActivity = async (type: string, itemId: string) => {
    if (!booking) return;
    setAddingActivity(itemId);
    try {
      await bookingsApi.addActivity(booking.id, { type, itemId });
      setBookedItemIds(prev => new Set([...prev, itemId]));
      enqueueSnackbar('Added to itinerary!', { variant: 'success' });
    } catch (err: any) {
      console.error('Add activity error:', err);
      const isConflict = err.status === 409;
      const msg = err.message || 'Error adding activity';

      if (isConflict) {
        enqueueSnackbar(msg, { 
          variant: 'warning',
          autoHideDuration: 6000,
          anchorOrigin: { vertical: 'top', horizontal: 'center' }
        });
      } else {
        enqueueSnackbar(msg, { variant: 'error' });
      }
    } finally {
      setAddingActivity(null);
    }
  };

  const handleProcessPayment = () => {
    setConfirming(true);
    setTimeout(() => {
      setConfirming(false);
      setStep(5); // Success screen
      enqueueSnackbar(`Payment successful!`, { variant: 'success' });
    }, 1500);
  };

  if (authLoading || loading) return <Container sx={{ py: 8, textAlign: 'center' }}><CircularProgress /><Typography mt={2}>Loading booking details...</Typography></Container>;
  
  if (errorMsg) return (
    <Container sx={{ py: 8 }}>
      <Alert severity="error" sx={{ mb: 4 }}>
        <Typography variant="h6">Unable to load booking</Typography>
        <Typography>{errorMsg}</Typography>
      </Alert>
      <Button component={Link} href="/" variant="contained">Return to Search</Button>
    </Container>
  );

  if (!cruise) return (
    <Container sx={{ py: 8 }}>
      <Alert severity="warning" sx={{ mb: 4 }}>
        <Typography variant="h6">Cruise Not Found</Typography>
        <Typography>The cruise you are trying to book (ID: {cruiseId}) could not be retrieved from our system.</Typography>
      </Alert>
      <Button component={Link} href="/" variant="contained">Return to Search</Button>
    </Container>
  );

  const availableRooms = rooms.filter(r => r.status === 'available');
  const wifiPrice = selectedWifi === 'premium' ? 149 : selectedWifi === 'standard' ? 89 : 0;
  const totalPricing = selectedRoom ? priceForRoom(selectedRoom) + wifiPrice : 0;

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h4" fontWeight={800} mb={1}>Complete your Booking</Typography>
      <Typography color="text.secondary" mb={4}>{cruise.name} · {pkg ? pkg.title : 'Select a Package'}</Typography>

      <Stepper activeStep={step} sx={{ mb: 6 }} alternativeLabel>
        {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
      </Stepper>

      {/* ─── Step 0: Select Package ─── */}
      {step === 0 && (
        <Box>
          <Typography variant="h5" fontWeight={700} mb={3}><ExploreIcon sx={{ mr: 1, verticalAlign: 'text-bottom' }}/> Choose Your Package</Typography>
          <Grid container spacing={4}>
            {packagesData.map((p: Package) => (
              <Grid item xs={12} md={4} key={p.id}>
                <Card sx={{
                  cursor: 'pointer', transition: '0.2s', borderRadius: 3,
                  borderColor: selectedPackageId === p.id ? 'primary.main' : 'divider',
                  borderWidth: selectedPackageId === p.id ? 2 : 1, borderStyle: 'solid',
                  bgcolor: selectedPackageId === p.id ? 'primary.50' : 'background.paper',
                  '&:hover': { boxShadow: '0 10px 30px rgba(0,0,0,0.1)', transform: 'translateY(-4px)' }
                }} onClick={() => setSelectedPackageId(p.id)}>
                  <CardMedia component="img" height="160" image={p.images[0]} alt={p.title} />
                  <CardContent>
                    <Typography variant="h6" fontWeight={800}>{p.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ minHeight: 60, mt: 1 }}>{p.description}</Typography>
                    <Divider sx={{ my: 2 }} />
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" fontWeight={700} color="primary">{p.durationDays} Days</Typography>
                      <Typography variant="h6" fontWeight={800}>${p.price.toLocaleString()}<Typography variant="caption">/pp</Typography></Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box mt={4} textAlign="right">
            <Button variant="contained" size="large" onClick={() => setStep(1)} disabled={!selectedPackageId} sx={{ px: 4, py: 1.5 }}>
              Continue to Cabin Selection
            </Button>
          </Box>
        </Box>
      )}

      {/* ─── Step 1: Select Cabin ─── */}
      {step === 1 && (
        <Box>
          <Typography variant="h5" fontWeight={700} mb={3}><HotelIcon sx={{ mr: 1, verticalAlign: 'text-bottom' }}/> Choose Cabin & Guests</Typography>
          
          {pkg && (
            <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}>
              Pricing is scaled based on your selected <strong>{pkg.title}</strong> duration.
            </Alert>
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} mb={4} alignItems="center" bgcolor="white" p={3} borderRadius={3} boxShadow="0 4px 20px rgba(0,0,0,0.05)">
            <Typography fontWeight={600}>Number of Guests:</Typography>
            <Slider value={guestCount} onChange={(_, v) => setGuestCount(v as number)}
              min={1} max={4} marks step={1} valueLabelDisplay="auto" sx={{ maxWidth: 200, mx: 2 }} />
            <Typography variant="h6" color="primary">{guestCount} Guest{guestCount > 1 ? 's' : ''}</Typography>
          </Stack>

          <RadioGroup value={selectedRoom?.id || ''} onChange={e => setSelectedRoom(availableRooms.find(r => r.id === e.target.value) || null)}>
            {['inside', 'ocean_view', 'balcony', 'suite'].map(type => {
              const roomsOfType = availableRooms.filter(r => r.type === type);
              if (roomsOfType.length === 0) return null;
              
              return (
                <Box key={type} mb={5}>
                  <Typography variant="h6" fontWeight={700} mb={2} sx={{ display: 'flex', alignItems: 'center' }}>
                    <HotelIcon sx={{ mr: 1, color: 'primary.main' }} /> {roomTypeLabel[type]} Cabins
                  </Typography>
                  <Grid container spacing={3}>
                    {roomsOfType.slice(0, 6).map(room => (
                      <Grid item xs={12} sm={6} md={4} key={room.id}>
                        <Card variant="outlined" sx={{
                          borderRadius: 3, cursor: 'pointer', transition: '0.2s', position: 'relative',
                          borderColor: selectedRoom?.id === room.id ? 'primary.main' : 'divider',
                          borderWidth: selectedRoom?.id === room.id ? 2 : 1,
                          borderStyle: 'solid',
                          bgcolor: selectedRoom?.id === room.id ? 'primary.50' : 'background.paper',
                          overflow: 'hidden',
                          '&:hover': { boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }
                        }} onClick={() => setSelectedRoom(room)}>
                          <CardMedia
                            component="img"
                            height="140"
                            image={room.imageUrl || '/images/default-room.jpg'}
                            alt={roomTypeLabel[room.type]}
                          />
                          <CardContent sx={{ p: 3 }}>
                             <RadioGroup value={selectedRoom?.id || ''}>
                               <FormControlLabel value={room.id} control={<Radio />} label="" sx={{ m: 0, position: 'absolute', top: 10, right: 10, zIndex: 1, bgcolor: 'rgba(255,255,255,0.8)', borderRadius: '50%', p: 0.5 }} />
                             </RadioGroup>
                             <Box>
                                <Chip label={roomTypeLabel[room.type]} size="small" color="primary" sx={{ mb: 1, fontWeight: 'bold' }} />
                                <Typography variant="subtitle1" fontWeight={700}>Room #{room.roomNumber}</Typography>
                                <Typography variant="body2" color="text.secondary">Deck {room.deck} · {room.sizeSqft} sqft</Typography>
                                <Divider sx={{ my: 1.5 }} />
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                   <Typography variant="h6" color="primary.main" fontWeight={800}>
                                     ${(priceForRoom(room) / guestCount).toLocaleString()}
                                   </Typography>
                                   <Typography variant="caption" color="text.secondary">per person</Typography>
                                </Box>
                             </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              );
            })}
          </RadioGroup>

          <Box mt={4} display="flex" justifyContent="space-between">
            <Button size="large" onClick={() => setStep(0)}>Back to Packages</Button>
            <Button variant="contained" size="large" onClick={() => setStep(2)} disabled={!selectedRoom} sx={{ px: 4, py: 1.5 }}>
              Continue to Passenger Details
            </Button>
          </Box>
        </Box>
      )}

      {/* ─── Step 2: Passenger Details ─── */}
      {step === 2 && (
        <Box maxWidth="800px" mx="auto">
          <Typography variant="h5" fontWeight={700} mb={3}><GroupIcon sx={{ mr: 1, verticalAlign: 'text-bottom' }}/> Passenger Details</Typography>
          <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
            <Stack spacing={4}>
              {passengers.map((p, idx) => (
                <Box key={idx}>
                  <Typography variant="h6" fontWeight={700} mb={2}>Guest {idx + 1} {idx === 0 ? '(Primary)' : ''}</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Full Name" value={p.name} onChange={e => {
                        const newP = [...passengers]; newP[idx].name = e.target.value; setPassengers(newP);
                      }} required />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Email Address" type="email" value={p.email} onChange={e => {
                        const newP = [...passengers]; newP[idx].email = e.target.value; setPassengers(newP);
                      }} required={idx === 0} />
                    </Grid>
                  </Grid>
                  {idx < passengers.length - 1 && <Divider sx={{ mt: 3 }} />}
                </Box>
              ))}
              
              <Box mt={2}>
                 <Typography variant="h6" fontWeight={700} mb={2}>Special Requests</Typography>
                 <TextField fullWidth multiline rows={3} placeholder="Dietary requirements, accessibility needs, etc." value={specialRequests} onChange={e => setSpecialRequests(e.target.value)} />
              </Box>

            </Stack>
          </Paper>

          <Box mt={4} display="flex" justifyContent="space-between">
            <Button size="large" onClick={() => setStep(1)}>Back</Button>
            <Button variant="contained" size="large" onClick={handleCreateBooking} disabled={confirming || !passengers[0].name} sx={{ px: 4 }}>
              {confirming ? <CircularProgress size={24} color="inherit" /> : 'Save & Continue'}
            </Button>
          </Box>
        </Box>
      )}

      {/* ─── Step 3: Add Extras ─── */}
      {step === 3 && booking && (
        <Box>
          <Typography variant="h5" fontWeight={700} mb={3}><ExtensionIcon sx={{ mr: 1, verticalAlign: 'text-bottom' }}/> Add Extras & Onboard Activities</Typography>
          
          <Paper sx={{ p: 3, mb: 4, borderRadius: 3, border: '2px solid', borderColor: 'primary.main', bgcolor: 'primary.50' }}>
            <Typography variant="h6" fontWeight={700} mb={2}><WifiIcon sx={{ mr: 1, verticalAlign: 'text-bottom' }}/> WiFi Packages (per device/voyage)</Typography>
            <RadioGroup value={selectedWifi} onChange={(e) => setSelectedWifi(e.target.value)} row>
              <FormControlLabel value="none" control={<Radio />} label="No WiFi" />
              <FormControlLabel value="standard" control={<Radio />} label="Standard - Surfing & Email ($89)" />
              <FormControlLabel value="premium" control={<Radio />} label="Premium - Streaming & Video Calls ($149)" />
            </RadioGroup>
          </Paper>

          {/* Casino Events */}
          <Typography variant="h6" fontWeight={700} mb={2}><CasinoIcon sx={{ mr: 1, verticalAlign: 'text-bottom' }} />Casino Tournaments & VIP Passes</Typography>
          <Grid container spacing={2} mb={4}>
            {casinoEvents.map(ce => (
              <Grid item xs={12} sm={4} key={ce.id}>
                <Card sx={{ opacity: bookedItemIds.has(ce.id) ? 0.7 : 1, borderRadius: 3 }}>
                  <CardMedia component="img" height="140" image={ce.imageUrl || 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=800'} alt={ce.name} />
                  <CardContent>
                    <Typography fontWeight={700} noWrap>{ce.name}</Typography>
                    <Typography variant="body2" color="text.secondary" mb={1}>{ce.gameType.replace('_', ' ')} · {new Date(ce.eventDate).toLocaleDateString()} at {ce.startTime}</Typography>
                    <Button fullWidth variant={bookedItemIds.has(ce.id) ? 'outlined' : 'contained'} size="small"
                      disabled={bookedItemIds.has(ce.id) || addingActivity === ce.id}
                      onClick={() => handleAddActivity('casino_event', ce.id)}>
                      {bookedItemIds.has(ce.id) ? '✓ Registered' : 'Join Event'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Restaurant Slots */}
          <Typography variant="h6" fontWeight={700} mb={2}><RestaurantIcon sx={{ mr: 1, verticalAlign: 'text-bottom' }} />Dining Reservations</Typography>
          <Grid container spacing={2} mb={4}>
            {slots.map(slot => (
              <Grid item xs={12} sm={4} key={slot.id}>
                <Card sx={{ opacity: bookedItemIds.has(slot.id) ? 0.7 : 1, borderRadius: 3 }}>
                  <CardMedia component="img" height="140" image={slot.restaurant.imageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800'} alt={slot.restaurant.name} />
                  <CardContent>
                    <Typography fontWeight={700}>{slot.restaurant.name}</Typography>
                    <Typography variant="body2" color="text.secondary" mb={1}>{new Date(slot.slotDate).toLocaleDateString()} · {slot.startTime} - {slot.endTime}</Typography>
                    <Button fullWidth variant={bookedItemIds.has(slot.id) ? 'outlined' : 'contained'} size="small"
                      disabled={bookedItemIds.has(slot.id) || addingActivity === slot.id}
                      onClick={() => handleAddActivity('restaurant_slot', slot.id)}>
                      {bookedItemIds.has(slot.id) ? '✓ Booked' : 'Reserve Table'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Shows */}
          <Typography variant="h6" fontWeight={700} mb={2}><TheaterComedyIcon sx={{ mr: 1, verticalAlign: 'text-bottom' }} />Entertainment</Typography>
          <Grid container spacing={2} mb={4}>
            {shows.map(show => (
              <Grid item xs={12} sm={4} key={show.id}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardMedia component="img" height="140" image={show.imageUrl || 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800'} alt={show.name} />
                  <CardContent>
                    <Typography fontWeight={700}>{show.name}</Typography>
                    <Typography variant="body2" color="text.secondary" mb={1}>{new Date(show.showDate).toLocaleDateString()} at {show.startTime} · {show.durationMinutes} min</Typography>
                    <Button fullWidth variant={bookedItemIds.has(show.id) ? 'outlined' : 'contained'} size="small"
                      disabled={bookedItemIds.has(show.id) || addingActivity === show.id}
                      onClick={() => handleAddActivity('show', show.id)}>
                      {bookedItemIds.has(show.id) ? '✓ Reserved' : 'Get Tickets'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box mt={4} display="flex" justifyContent="space-between">
            <Button size="large" onClick={() => setStep(2)}>Back</Button>
            <Button variant="contained" size="large" onClick={() => setStep(4)} sx={{ px: 4 }}>
              Continue to Payment
            </Button>
          </Box>
        </Box>
      )}

      {/* ─── Step 4: Payment Summary ─── */}
      {step === 4 && booking && selectedRoom && pkg && (
        <Box maxWidth="800px" mx="auto">
          <Typography variant="h5" fontWeight={700} mb={3}><PaymentIcon sx={{ mr: 1, verticalAlign: 'text-bottom' }}/> Payment Summary</Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={7}>
              <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
                <Typography variant="h6" fontWeight={700} mb={3}>Order Details</Typography>
                <Stack spacing={2}>
                   <Box display="flex" justifyContent="space-between">
                     <Typography color="text.secondary">Package Base Fare ({pkg.title})</Typography>
                     <Typography fontWeight={600}>${(pkg.price * guestCount).toLocaleString()}</Typography>
                   </Box>
                   <Box display="flex" justifyContent="space-between">
                     <Typography color="text.secondary">Cabin Selection ({roomTypeLabel[selectedRoom.type]})</Typography>
                     <Typography fontWeight={600}>${(priceForRoom(selectedRoom) - (pkg.price * guestCount)).toLocaleString()}</Typography>
                   </Box>
                   <Divider />
                   <Box display="flex" justifyContent="space-between">
                     <Typography color="text.secondary">Taxes & Port Fees</Typography>
                     <Typography fontWeight={600}>$150</Typography>
                   </Box>
                   <Box display="flex" justifyContent="space-between">
                     <Typography color="text.secondary">WiFi Package ({selectedWifi})</Typography>
                     <Typography fontWeight={600}>${wifiPrice}</Typography>
                   </Box>
                   <Box display="flex" justifyContent="space-between">
                     <Typography color="text.secondary">Pre-Booked Activities</Typography>
                     <Typography fontWeight={600}>{bookedItemIds.size} Included</Typography>
                   </Box>
                   <Divider />
                   <Box display="flex" justifyContent="space-between" mt={2}>
                     <Typography variant="h6" fontWeight={800}>Total Amount</Typography>
                     <Typography variant="h5" fontWeight={800} color="primary.main">${(totalPricing + 150).toLocaleString()}</Typography>
                   </Box>
                </Stack>
              </Paper>
            </Grid>
            <Grid item xs={12} md={5}>
              <Paper sx={{ p: 4, borderRadius: 3, bgcolor: '#f8f9fa' }}>
                <Typography variant="h6" fontWeight={700} mb={3}>Payment Method</Typography>
                <TextField fullWidth label="Card Number" placeholder="**** **** **** ****" sx={{ mb: 2, bgcolor: 'white' }} />
                <Grid container spacing={2} mb={2}>
                  <Grid item xs={6}><TextField fullWidth label="Expiry (MM/YY)" /></Grid>
                  <Grid item xs={6}><TextField fullWidth label="CVC" type="password" /></Grid>
                </Grid>
                <TextField fullWidth label="Name on Card" sx={{ mb: 3 }} />
                
                <Button fullWidth variant="contained" size="large" onClick={handleProcessPayment} disabled={confirming} sx={{ py: 2, fontSize: '1.1rem' }}>
                  {confirming ? <CircularProgress size={24} color="inherit" /> : `Pay $${(totalPricing + 150).toLocaleString()}`}
                </Button>
              </Paper>
            </Grid>
          </Grid>
          <Box mt={4}>
            <Button onClick={() => setStep(3)}>Back to Extras</Button>
          </Box>
        </Box>
      )}

      {/* ─── Step 5: Success ─── */}
      {step === 5 && booking && (
        <Box textAlign="center" py={8}>
          <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h3" fontWeight={800} mb={2}>Booking Confirmed!</Typography>
          <Typography variant="h6" color="text.secondary" mb={4}>
            Your reference number is <strong>{booking.bookingReference}</strong>
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button variant="contained" size="large" component={Link} href="/my-itinerary">View Itinerary</Button>
            <Button variant="outlined" size="large" component={Link} href="/">Back to Home</Button>
          </Stack>
        </Box>
      )}
    </Container>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<Container sx={{ py: 8 }}><CircularProgress /></Container>}>
      <BookingPageContent />
    </Suspense>
  );
}
