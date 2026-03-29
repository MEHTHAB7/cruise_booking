'use client';
import React, { useState } from 'react';
import { Box, Container, Paper, Typography, TextField, Button, Link as MuiLink, Alert, Stack, Divider } from '@mui/material';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSnackbar } from 'notistack';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password.trim());
      enqueueSnackbar('Welcome back!', { variant: 'success' });
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', background: 'linear-gradient(135deg, #F4F8FB 0%, #E8F4FD 100%)', py: 4 }}>
      <Container maxWidth="xs">
        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <Stack alignItems="center" mb={3}>
            <DirectionsBoatIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h5" fontWeight={800} color="primary.main">OceanVoyage</Typography>
            <Typography variant="body2" color="text.secondary">Sign in to your account</Typography>
          </Stack>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField fullWidth label="Email address" type="email" value={email}
              onChange={e => setEmail(e.target.value)} required sx={{ mb: 2 }} />
            <TextField fullWidth label="Password" type="password" value={password}
              onChange={e => setPassword(e.target.value)} required sx={{ mb: 3 }} />
            <Button fullWidth type="submit" variant="contained" size="large" disabled={loading} sx={{ py: 1.5 }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </Box>
          <Divider sx={{ my: 3 }} />
          <Typography variant="body2" textAlign="center">
            Don't have an account?{' '}
            <MuiLink component={Link} href="/register" fontWeight={700}>Create one free</MuiLink>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
