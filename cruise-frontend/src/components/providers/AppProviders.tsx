'use client';

import { ThemeProvider, CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import theme from '@/theme';
import { AuthProvider } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <AuthProvider>
          <Navbar />
          <main style={{ minHeight: '100vh', background: '#F4F8FB' }}>
            {children}
          </main>
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}