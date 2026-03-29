'use client';
import React, { useState } from 'react';
import {
  Box, Container, Paper, Typography, TextField, Button, Link as MuiLink,
  Alert, Stack, FormControlLabel, Checkbox, Divider,
} from '@mui/material';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useSnackbar } from 'notistack';

export default function RegisterPage() {
  const { refresh } = useAuth();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '', privacyAccepted: false, marketingConsent: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key: string) => (e: any) => setForm(f => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.privacyAccepted) { setError('Please accept the privacy policy to continue.'); return; }
    setError('');
    setLoading(true);
    try {
      await authApi.register(form);
      await refresh();
      enqueueSnackbar('Account created! Welcome aboard!', { variant: 'success' });
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', background: 'linear-gradient(135deg, #F4F8FB 0%, #E8F4FD 100%)', py: 4 }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <Stack alignItems="center" mb={3}>
            <DirectionsBoatIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h5" fontWeight={800}>Create Your Account</Typography>
            <Typography variant="body2" color="text.secondary">Join OceanVoyage and set sail</Typography>
          </Stack>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
              <TextField fullWidth label="First Name" value={form.firstName} onChange={set('firstName')} required />
              <TextField fullWidth label="Last Name" value={form.lastName} onChange={set('lastName')} required />
            </Stack>
            <TextField fullWidth label="Email address" type="email" value={form.email} onChange={set('email')} required sx={{ mb: 2 }} />
            <TextField fullWidth label="Password (min 8 chars)" type="password" value={form.password} onChange={set('password')} required inputProps={{ minLength: 8 }} sx={{ mb: 2 }} />
            <TextField fullWidth label="Phone (optional)" value={form.phone} onChange={set('phone')} sx={{ mb: 2 }} />
            <FormControlLabel
              control={<Checkbox checked={form.privacyAccepted} onChange={set('privacyAccepted')} color="primary" />}
              label={<Typography variant="body2">I accept the <MuiLink href="#">Privacy Policy</MuiLink> and Terms of Service *</Typography>}
              sx={{ mb: 1 }}
            />
            <FormControlLabel
              control={<Checkbox checked={form.marketingConsent} onChange={set('marketingConsent')} color="secondary" />}
              label={<Typography variant="body2">Send me special offers and cruise deals (optional)</Typography>}
              sx={{ mb: 3 }}
            />
            <Button fullWidth type="submit" variant="contained" size="large" disabled={loading} sx={{ py: 1.5 }}>
              {loading ? 'Creating account…' : 'Create Account'}
            </Button>
          </Box>
          <Divider sx={{ my: 3 }} />
          <Typography variant="body2" textAlign="center">
            Already have an account? <MuiLink component={Link} href="/login" fontWeight={700}>Sign in</MuiLink>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
