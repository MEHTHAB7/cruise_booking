"use client";

import { Card, CardContent, Typography, Box, Stack, Divider, Button, Alert } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function BookingWidget({ cruiseId, packageId, price }: { cruiseId: string, packageId: string, price: number }) {
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <Card sx={{ position: 'sticky', top: 100, borderRadius: 3, boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight={800} mb={1}>Book This Package</Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>Proceed to customize your cabin and finalize your journey.</Typography>

        <Stack spacing={2} mb={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography color="text.secondary">Starting From</Typography>
            <Typography variant="h5" fontWeight={800} color="primary.main">${price.toLocaleString()}<Typography component="span" variant="caption" color="text.secondary">/pp</Typography></Typography>
          </Box>
        </Stack>

        {isAdmin && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
            <Typography variant="caption" fontWeight={600}>
              Admins cannot create bookings. Please use a guest account.
            </Typography>
          </Alert>
        )}

        <Button
          fullWidth variant="contained" size="large" 
          onClick={() => router.push(`/booking/${cruiseId}?packageId=${packageId}`)}
          disabled={isAdmin}
          endIcon={<ArrowForwardIcon />} sx={{ py: 1.8, fontSize: '1.1rem', fontWeight: 700 }}>
          {isAdmin ? 'Booking Restricted' : 'Book Now'}
        </Button>
      </CardContent>
    </Card>
  );
}
