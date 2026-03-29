'use client';
import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Paper, Grid, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, CircularProgress, Alert, Button, Stack
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { adminApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function BookingsListPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<any>(null);
  const [bookingsData, setBookingsData] = useState<{ data: any[], total: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') {
        router.push('/');
      } else {
        loadData();
      }
    }
  }, [user, authLoading, router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getAllBookings(1, 50)
      ]);
      setStats(statsRes);

      // TypeORM findAndCount returns [items, count]
      if (Array.isArray(bookingsRes) && bookingsRes.length === 2) {
        setBookingsData({ data: bookingsRes[0], total: bookingsRes[1] });
      } else {
        setBookingsData({ data: bookingsRes || [], total: (bookingsRes || []).length });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (loading && !error)) {
    return (
      <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa', py: 6 }}>
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" fontWeight={800} display="flex" alignItems="center">
            <DashboardIcon sx={{ mr: 2, fontSize: 36, color: 'primary.main' }} />
            List of Bookings
          </Typography>
          <Button variant="contained" color="secondary" onClick={() => router.push('/admin/manage-cruise')} sx={{ px: 3, py: 1.5, fontWeight: 700 }}>
            + Manage Cruises & Data
          </Button>
        </Box>

        {stats && (
          <Grid container spacing={3} mb={6}>
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography color="text.secondary" variant="subtitle2" fontWeight={600} gutterBottom>TOTAL BOOKINGS</Typography>
                  <Typography variant="h3" fontWeight={800}>{stats.totalBookings}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography color="text.secondary" variant="subtitle2" fontWeight={600} gutterBottom>CONFIRMED BOOKINGS</Typography>
                  <Typography variant="h3" fontWeight={800} color="success.main">{stats.confirmedBookings}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ opacity: 0.8 }}>TOTAL REVENUE</Typography>
                  <Typography variant="h3" fontWeight={800}>${Number(stats.totalRevenue).toLocaleString()}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {stats && (
          <Grid container spacing={3} mb={6}>
            {/* Top Cruises */}
            <Grid item xs={12} md={7}>
              <Paper sx={{ p: 3, borderRadius: 3, height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Typography variant="h6" fontWeight={700} mb={3}>Popular Cruises by Revenue</Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Cruise Name</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Bookings</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Revenue</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.popularCruises?.map((c: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell>{c.cruiseName}</TableCell>
                        <TableCell align="right">{c.bookingCount}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          ${Number(c.totalRevenue).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Grid>

            {/* Room Distribution */}
            <Grid item xs={12} md={5}>
              <Paper sx={{ p: 3, borderRadius: 3, height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Typography variant="h6" fontWeight={700} mb={3}>Cabin Distribution</Typography>
                <Stack spacing={3}>
                  {stats.roomTypeDistribution?.map((r: any, idx: number) => (
                    <Box key={idx}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                          {r.type.replace('_', ' ')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {r.count} Bookings
                        </Typography>
                      </Box>
                      <Box sx={{ width: '100%', height: 8, bgcolor: 'grey.100', borderRadius: 4, overflow: 'hidden' }}>
                        <Box sx={{ 
                          width: `${(r.count / stats.totalBookings) * 100}%`, 
                          height: '100%', 
                          bgcolor: r.type === 'suite' ? 'secondary.main' : 'primary.main',
                          borderRadius: 4
                        }} />
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        )}

        <Typography variant="h5" fontWeight={700} mb={3}>Recent Bookings Details</Typography>
        <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Booking ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>User Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Cruise</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Room</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date Booked</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Total Price</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookingsData?.data?.map((b: any) => (
                  <TableRow key={b.id} hover>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{b.id.substring(0, 8)}...</TableCell>
                    <TableCell>{b.user?.email || 'Guest'}</TableCell>
                    <TableCell>{b.cruise?.name || 'N/A'}</TableCell>
                    <TableCell>{b.room ? `Room ${b.room.roomNumber} (${b.room.type})` : 'N/A'}</TableCell>
                    <TableCell>{new Date(b.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      ${Number(b.totalPrice).toLocaleString()}
                    </TableCell>                    <TableCell>
                      <Chip
                        label={b.status.toUpperCase()}
                        size="small"
                        color={b.status === 'confirmed' ? 'success' : b.status === 'cancelled' ? 'error' : 'default'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {(!bookingsData?.data || bookingsData.data.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <ReceiptIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                      <Typography color="text.secondary">No bookings found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </Box>
  );
}