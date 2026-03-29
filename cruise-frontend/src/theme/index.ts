import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0057A8',
      light: '#4488D4',
      dark: '#003B75',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#00A896',
      light: '#4ECDC4',
      dark: '#007A6C',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F4F8FB',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A2B3C',
      secondary: '#4A6070',
    },
    error: { main: '#D32F2F' },
    warning: { main: '#F57C00' },
    success: { main: '#2E7D32' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 4px 12px rgba(0,87,168,0.25)' },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #0057A8 0%, #0072CE 100%)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
          borderRadius: 16,
          '&:hover': { boxShadow: '0 8px 32px rgba(0,87,168,0.15)', transform: 'translateY(-2px)', transition: 'all 0.2s ease' },
          transition: 'all 0.2s ease',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
      },
    },
  },
});

export default theme;
