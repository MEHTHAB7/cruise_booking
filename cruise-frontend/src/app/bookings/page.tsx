'use client';

import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Box, Paper, Grid, Chip, Button,
  Divider, Skeleton, Stack, Card, CardContent, CardMedia,
  Alert, CircularProgress
} from '@mui/material';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import TheaterComedyIcon from '@mui/icons-material/TheaterComedy';
import CasinoIcon from '@mui/icons-material/Casino';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Link from 'next/link';
import { bookingsApi } from '@/lib/api';
import { Booking } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const itemIcon: Record<string, React.ReactElement> = {
  restaurant_slot: <RestaurantIcon fontSize="small" color="primary" />,
  show: <TheaterComedyIcon fontSize="small" color="secondary" />,
  casino_event: <CasinoIcon fontSize="small" sx={{ color: 'warning.main' }} />,
};

function BookingItem({ booking }: { booking: Booking }) {
  const [expanded, setExpanded] = React.useState(false);

  // Group items by date
  const sortedItems = [...booking.items].sort((a, b) =>
    new Date(a.activityDate).getTime() - new Date(b.activityDate).getTime() ||
    a.startTime.localeCompare(b.startTime)
  );

  const grouped: Record<string, typeof sortedItems> = {};
  sortedItems.forEach(item => {
    const d = new Date(item.activityDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    if (!grouped[d]) grouped[d] = [];
    grouped[d].push(item);
  });

  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
      <Grid container>
        {/* Cruise Image */}
        <Grid item xs={12} md={3}>
          <CardMedia
            component="img"
            image={booking.cruise.imageUrl || '/images/default-cruise.jpg'}
            alt={booking.cruise.name}
            sx={{ height: '100%', minHeight: { xs: 150, md: '100%' }, objectFit: 'cover' }}
          />
        </Grid>

        {/* Booking Details */}
        <Grid item xs={12} md={9}>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
              <Box>
                <Typography variant="h6" fontWeight={800}>{booking.cruise.name}</Typography>
                <Stack direction="row" spacing={2} alignItems="center" color="text.secondary" mt={0.5}>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <CalendarMonthIcon fontSize="small" />
                    <Typography variant="body2">
                      {new Date(booking.cruise.departureDate).toLocaleDateString()} - {new Date(booking.cruise.returnDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <DirectionsBoatIcon fontSize="small" />
                    <Typography variant="body2">{booking.cruise.ship?.name}</Typography>
                  </Box>
                </Stack>
              </Box>

              <Box textAlign={{ xs: 'left', md: 'right' }}>
                <Chip 
                  label={booking.status.toUpperCase()} 
                  color={booking.status === 'confirmed' ? 'success' : 'error'}
                  size="small" 
                  sx={{ fontWeight: 700, mb: 1 }}
                />
                <Typography variant="h6" fontWeight={800} color="primary.main">
                  ${Number(booking.totalPrice).toLocaleString()}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary" display="block">BOOKING REFERENCE</Typography>
                <Typography variant="body2" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ConfirmationNumberIcon fontSize="small" /> {booking.bookingReference}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary" display="block">CABIN TYPE</Typography>
                <Typography variant="body2" fontWeight={700}>{booking.room.type.replace('_', ' ')} (Deck {booking.room.deck})</Typography>
              </Grid>
              <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' }, gap: 1 }}>
                {booking.items.length > 0 && (
                  <Button 
                    variant="outlined" 
                    endIcon={<ExpandMoreIcon sx={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />}
                    onClick={() => setExpanded(!expanded)}
                  >
                    {expanded ? 'Hide Itinerary' : 'View Itinerary'}
                  </Button>
                )}
                <Button variant="contained" component={Link} href={`/cruises/${booking.cruise.id}`}>
                  Trip Details
                </Button>
              </Grid>
            </Grid>

            {/* EXPANDABLE ITINERARY */}
            {expanded && (
               <Box mt={3} p={2} bgcolor="grey.50" borderRadius={2} border="1px solid" borderColor="grey.200">
                <Typography variant="subtitle2" fontWeight={800} mb={2} color="primary.main">DAILY SCHEDULE</Typography>
                {Object.entries(grouped).map(([date, items]) => (
                  <Box key={date} mb={2}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary">{date.toUpperCase()}</Typography>
                    <Stack spacing={1} mt={0.5}>
                      {items.map(item => (
                        <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1, bgcolor: 'white', borderRadius: 1.5, border: '1px solid', borderColor: 'grey.100' }}>
                          {itemIcon[item.itemType]}
                          <Box flexGrow={1}>
                            <Typography variant="body2" fontWeight={700}>{item.itemName}</Typography>
                            <Typography variant="caption" color="text.secondary">{item.startTime} - {item.endTime}</Typography>
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                ))}
               </Box>
            )}
          </CardContent>
        </Grid>
      </Grid>
    </Card>
  );
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    
    bookingsApi.getMyBookings()
      .then(data => {
        setBookings(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message || 'Failed to load bookings');
        setLoading(false);
      });
  }, [user]);

  if (loading) {
    return (
      <Container sx={{ py: 8 }}>
        <Typography variant="h4" fontWeight={800} mb={4}>My Journeys</Typography>
        <Stack spacing={3}>
          {[1, 2, 3].map(i => <Skeleton key={i} variant="rectangular" height={150} sx={{ borderRadius: 3 }} />)}
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 8 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" fontWeight={800} mb={1}>My Journeys</Typography>
        <Typography color="text.secondary" mb={4}>Manage your upcoming voyages and view your daily schedules</Typography>

        {bookings.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4 }}>
            <DirectionsBoatIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" mb={3}>No bookings found yet.</Typography>
            <Button variant="contained" component={Link} href="/" size="large">
              Explore Cruises
            </Button>
          </Paper>
        ) : (
          <Stack spacing={3}>
            {bookings.map(booking => (
              <BookingItem key={booking.id} booking={booking} />
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
}
