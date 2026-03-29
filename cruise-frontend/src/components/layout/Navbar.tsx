'use client';

import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, IconButton,
  Box, Menu, MenuItem, Avatar, Drawer, List, ListItem,
  ListItemButton, ListItemText, Divider, useMediaQuery, useTheme, Chip,
} from '@mui/material';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import MenuIcon from '@mui/icons-material/Menu';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSnackbar } from 'notistack';

const navLinks = [
  { label: 'Explore Cruises', href: '/' },
  { label: 'My Bookings', href: '/bookings', authOnly: true, userOnly: true },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      enqueueSnackbar('Logged out successfully', { variant: 'success' });
      router.push('/');
    } catch {
      enqueueSnackbar('Logout failed', { variant: 'error' });
    } finally {
      setAnchorEl(null);
    }
  };

  // ✅ safer filtering
  const isGuest = user && user.role === 'guest';
  const isAdmin = user && user.role === 'admin';

  // ✅ safer filtering
  const visibleLinks = navLinks.filter(l => {
    if (l.authOnly && !user) return false;
    if (l.userOnly && isAdmin) return false;
    return true;
  });

  return (
    <>
      <AppBar
        position="sticky"
        sx={{ background: 'linear-gradient(135deg, #003B75 0%, #0057A8 100%)' }}
      >
        <Toolbar
          sx={{
            maxWidth: 1280,
            width: '100%',
            mx: 'auto',
            px: { xs: 2, md: 4 },
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexGrow: isMobile ? 1 : 0,
              marginRight: 32,
            }}
          >
            <DirectionsBoatIcon sx={{ fontSize: 32 }} />
            <Typography variant="h6" fontWeight={800} letterSpacing={-0.5}>
              OceanVoyage
            </Typography>
          </Link>

          {/* Desktop nav */}
          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
              {visibleLinks.map(l => (
                <Button
                  key={l.href}
                  color="inherit"
                  component={Link}
                  href={l.href}
                  sx={{ opacity: 0.9, '&:hover': { opacity: 1 } }}
                >
                  {l.label}
                </Button>
              ))}

              {/* ✅ Admin link protected */}
              {isAdmin && (
                <Button
                  color="inherit"
                  component={Link}
                  href="/admin"
                  startIcon={<AdminPanelSettingsIcon />}
                  sx={{ opacity: 0.9, '&:hover': { opacity: 1 } }}
                >
                  Bookings
                </Button>
              )}
            </Box>
          )}

          {/* Auth section */}
          {user ? (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {/* ✅ Admin badge */}
                {isAdmin && (
                  <Chip
                    label="ADMIN"
                    size="small"
                    color="secondary"
                    sx={{ fontWeight: 700, fontSize: 10 }}
                  />
                )}

                {/* Avatar */}
                <IconButton color="inherit" onClick={e => setAnchorEl(e.currentTarget)}>
                  <Avatar
                    src={isAdmin 
                      ? 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&fit=crop' 
                      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&fit=crop'}
                    sx={{
                      width: 34,
                      height: 34,
                      bgcolor: 'secondary.main',
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                  >
                    {user?.firstName?.[0] || ''}
                    {user?.lastName?.[0] || ''}
                  </Avatar>
                </IconButton>
              </Box>

              {/* Dropdown */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
              >
                <MenuItem disabled sx={{ opacity: '1 !important' }}>
                  <Box>
                    <Typography variant="body2" fontWeight={700}>
                      {user?.firstName || ''} {user?.lastName || ''}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user?.email || ''}
                    </Typography>
                  </Box>
                </MenuItem>

                <Divider />


                {isGuest && (
                  <MenuItem
                    component={Link}
                    href="/bookings"
                    onClick={() => setAnchorEl(null)}
                  >
                    My Bookings
                  </MenuItem>
                )}
                {/* ✅ Admin menu protected */}
                {isAdmin && (
                  <MenuItem
                    component={Link}
                    href="/admin"
                    onClick={() => setAnchorEl(null)}
                  >
                    List of Bookings
                  </MenuItem>
                )}

                <Divider />

                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                color="inherit"
                component={Link}
                href="/login"
                variant="outlined"
                sx={{
                  borderColor: 'rgba(255,255,255,0.5)',
                  color: '#fff',
                  '&:hover': { borderColor: '#fff' },
                }}
              >
                Log In
              </Button>

              <Button
                component={Link}
                href="/register"
                variant="contained"
                color="secondary"
                sx={{ fontWeight: 700 }}
              >
                Sign Up
              </Button>
            </Box>
          )}

          {/* Mobile menu */}
          {isMobile && (
            <IconButton color="inherit" sx={{ ml: 1 }} onClick={() => setMobileOpen(true)}>
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <Box sx={{ width: 260, pt: 2 }}>
          <Typography
            variant="h6"
            fontWeight={800}
            sx={{ px: 3, mb: 1, color: 'primary.main' }}
          >
            OceanVoyage
          </Typography>

          <Divider />

          <List>
            {visibleLinks.map(l => (
              <ListItem key={l.href} disablePadding>
                <ListItemButton
                  component={Link}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                >
                  <ListItemText primary={l.label} />
                </ListItemButton>
              </ListItem>
            ))}

            {isAdmin && (
              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                >
                  <ListItemText primary="List of Bookings" />
                </ListItemButton>
              </ListItem>
            )}
          </List>

          <Divider />

          {user ? (
            <List>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                >
                  <ListItemText
                    primary="Logout"
                    primaryTypographyProps={{ color: 'error.main' }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          ) : (
            <List>
              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                >
                  <ListItemText primary="Log In" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                >
                  <ListItemText primary="Sign Up" />
                </ListItemButton>
              </ListItem>
            </List>
          )}
        </Box>
      </Drawer>
    </>
  );
}