'use client';
import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardContent, Button, Chip,
  Stack, Divider, Alert, Skeleton, Paper, List, ListItem, ListItemText, ListItemIcon,
} from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import TheaterComedyIcon from '@mui/icons-material/TheaterComedy';
import CasinoIcon from '@mui/icons-material/Casino';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import HotelIcon from '@mui/icons-material/Hotel';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { bookingsApi } from '@/lib/api';
import { Booking } from '@/types';

const itemIcon: Record<string, React.ReactElement> = {
  restaurant_slot: <RestaurantIcon color="primary" />,
  show: <TheaterComedyIcon color="secondary" />,
  casino_event: <CasinoIcon sx={{ color: 'warning.main' }} />,
};

function BookingCard({ booking }: { booking: Booking }) {
  const sortedItems = [...booking.items].sort((a, b) =>
    new Date(a.activityDate).getTime() - new Date(b.activityDate).getTime() ||
    a.startTime.localeCompare(b.startTime)
  );
  const grouped: Record<string, typeof sortedItems> = {};
  sortedItems.forEach(item => {
    const key = new Date(item.activityDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} mb={2}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
              <ConfirmationNumberIcon color="primary" />
              <Typography variant="h6" fontWeight={700}>Ref: {booking.bookingReference}</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">{booking.cruise.name}</Typography>
          </Box>
          <Chip
            label={booking.status.toUpperCase()}
            color={booking.status === 'confirmed' ? 'success' : booking.status === 'cancelled' ? 'error' : 'default'}
            sx={{ fontWeight: 700 }}
          />
        </Stack>

        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={4}>
            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <DirectionsBoatIcon color="primary" fontSize="small" />
                <Box>
                  <Typography variant="caption" color="text.secondary">Cruise</Typography>
                  <Typography variant="body2" fontWeight={600}>{booking.cruise.durationNights} nights</Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <HotelIcon color="primary" fontSize="small" />
                <Box>
                  <Typography variant="caption" color="text.secondary">Room</Typography>
                  <Typography variant="body2" fontWeight={600}>#{booking.room.roomNumber} – {booking.room.type.replace('_', ' ')}</Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'primary.main', borderColor: 'primary.main' }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>Total Paid</Typography>
              <Typography variant="h6" fontWeight={800} color="white">${Number(booking.totalPrice).toLocaleString()}</Typography>
            </Paper>
          </Grid>
        </Grid>

        {booking.items.length === 0 ? (
          <Alert severity="info" sx={{ mb: 0 }}>No activities booked yet. Add some during your booking!</Alert>
        ) : (
          <>
            <Typography variant="subtitle1" fontWeight={700} mb={1}>Your Itinerary</Typography>
            {Object.entries(grouped).map(([date, items]) => (
              <Box key={date} mb={2}>
                <Typography variant="body2" fontWeight={700} color="primary.main" mb={0.5}>{date}</Typography>
                <List dense disablePadding>
                  {items.map(item => (
                    <ListItem key={item.id} disablePadding sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>{itemIcon[item.itemType]}</ListItemIcon>
                      <ListItemText
                        primary={item.itemName}
                        secondary={`${item.startTime} – ${item.endTime}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function MyItineraryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) {
      bookingsApi.getMyBookings().then(setBookings).catch(console.error).finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) return <Container sx={{ py: 8 }}><Skeleton variant="rectangular" height={300} /></Container>;

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h4" fontWeight={700} mb={4}>My Itinerary</Typography>
      {bookings.length === 0
        ? <Box textAlign="center" py={10}>
            <DirectionsBoatIcon sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" mb={3}>No bookings yet</Typography>
            <Button variant="contained" onClick={() => router.push('/')}>Explore Cruises</Button>
          </Box>
        : bookings.map(b => <BookingCard key={b.id} booking={b} />)
      }
    </Container>
  );
}
