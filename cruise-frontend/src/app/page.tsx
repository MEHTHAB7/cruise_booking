'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';

import {
  Box, Container, Typography, Grid, Card, CardMedia, CardContent, Button,
  TextField, MenuItem, InputAdornment, Chip, Skeleton, Paper, Stack, Divider, 
  Slider, Checkbox, FormControlLabel, Rating
} from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import PeopleIcon from '@mui/icons-material/People';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

import AiChatPanel from '@/components/ai/AiChatPanel';
import { cruisesApi, portsApi } from '@/lib/api';

function normalizeList<T>(value: any): T[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

function formatDate(dateValue?: string) {
  if (!dateValue) return '';
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return dateValue;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getPrice(cruise: any) {
  if (typeof cruise?.price === 'number') return cruise.price;
  const candidates = [
    cruise?.basePriceInside, cruise?.basePriceOceanView, 
    cruise?.basePriceBalcony, cruise?.basePriceSuite,
  ].filter((v) => v !== null && v !== undefined).map(v => Number(v));
  
  if (candidates.length === 0 || candidates.every(v => isNaN(v))) return 399; // Fallback
  return Math.min(...candidates.filter(v => !isNaN(v)));
}

function CruiseCard({ cruise }: { cruise: any }) {
  const departureName = cruise?.departurePort?.name || cruise?.departurePort?.city || 'Departure';
  const destinationName = cruise?.destinationPort?.name || cruise?.destinationPort?.city || 'Destination';
  const shipName = cruise?.ship?.name || 'Luxury Ship';
  const nightsLabel = cruise?.durationNights ? `${cruise.durationNights} Nights` : '5 Nights';
  const minPrice = getPrice(cruise);

  return (
    <Card sx={{
      height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, 
      overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
      transition: 'transform 0.2s ease, box-shadow 0.2s',
      '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 16px 40px rgba(0,0,0,0.12)' }
    }}>
      <CardMedia
        component="img" height="220"
        image={cruise?.imageUrl || '/images/IMG-20260326-WA0006.jpg'}
        alt={cruise?.name || 'Cruise'} sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Stack direction="row" justifyContent="space-between" mb={1} gap={1}>
          <Chip label={nightsLabel} size="small" color="primary" icon={<NightsStayIcon />} />
          <Chip label={cruise?.name || 'Route'} size="small" variant="outlined" sx={{ maxWidth: 150 }} />
        </Stack>
        <Typography variant="h6" fontWeight={700} gutterBottom lineHeight={1.2} mt={1}>
          {shipName}
        </Typography>
        <Stack direction="row" alignItems="center" spacing={0.5} mb={0.5}>
          <LocationOnIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
          <Typography variant="body2" color="text.secondary">{departureName} → {destinationName}</Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={0.5} mb={2}>
          <CalendarMonthIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">{formatDate(cruise?.departureDate) || 'Select Dates'}</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 2 }}>
          {cruise?.description || 'Enjoy a wonderful getaway on board our luxury cruise liner with exciting events and dining.'}
        </Typography>
      </CardContent>
      <Divider />
      <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="caption" color="text.secondary">From</Typography>
          <Typography variant="h6" color="primary.main" fontWeight={800} lineHeight={1.1}>
            ${Number(minPrice).toLocaleString()}
            <Typography component="span" variant="caption" color="text.secondary">/person</Typography>
          </Typography>
        </Box>
        <Stack alignItems="flex-end" spacing={1}>
          <Chip label="4 Packages Available" size="small" color="success" variant="outlined" sx={{ height: 24, fontSize: '0.7rem', fontWeight: 'bold' }} />
          <Button variant="contained" component={Link} href={`/cruises/${cruise?.id}`} size="small">
            View Details
          </Button>
        </Stack>
      </Box>
    </Card>
  );
}

export default function HomePage() {
  const [cruises, setCruises] = useState<any[]>([]);
  const [ports, setPorts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // Search state
  const [searchDestination, setSearchDestination] = useState('');
  const [searchPort, setSearchPort] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [searchGuests, setSearchGuests] = useState('2');

  // Filter Sidebar state
  const [priceRange, setPriceRange] = useState<number[]>([0, 10000]);
  const [filterDuration, setFilterDuration] = useState<string>('');
  const [filterShipName, setFilterShipName] = useState('');
  const [sortBy, setSortBy] = useState('departure_date');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');

  const fetchCruises = async () => {
    setLoading(true);
    try {
      const filters: any = {
        destination: searchDestination,
        departurePortId: searchPort,
        departureDateFrom: searchDate ? `${searchDate}-01` : undefined,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        shipName: filterShipName,
        sortBy,
        sortOrder,
      };

      if (filterDuration === 'short') { filters.minDuration = 1; filters.maxDuration = 4; }
      else if (filterDuration === 'medium') { filters.minDuration = 5; filters.maxDuration = 8; }
      else if (filterDuration === 'long') { filters.minDuration = 9; filters.maxDuration = 99; }

      const res = await cruisesApi.search(filters);
      setCruises(normalizeList<any>(res));
    } catch (e) {
      console.error(e);
      setCruises([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    portsApi.getAll().then(data => setPorts(normalizeList<any>(data))).catch(console.error);
    fetchCruises();
  }, [sortBy, sortOrder]); // Re-fetch on sort change

  const handleReset = () => {
    setSearchDestination('');
    setSearchPort('');
    setSearchDate('');
    setPriceRange([0, 10000]);
    setFilterDuration('');
    setFilterShipName('');
    setSortBy('departure_date');
    setSortOrder('ASC');
    // We'll trigger fetch after state updates in some way, 
    // but buttons/effects usually handle it. 
    // For simplicity here, let's just fetch manually.
    setTimeout(() => fetchCruises(), 0);
  };

  return (
    <Box>
      {/* Deals Banner */}
      <Box sx={{ bgcolor: 'secondary.main', color: 'white', py: 1, textAlign: 'center' }}>
        <Typography variant="body2" fontWeight="bold">
          <LocalOfferIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 1 }} />
          FLASH SALE: 60% OFF 2nd Guest + Kids Sail Free! Limited time only.
        </Typography>
      </Box>

      {/* 1. HERO SECTION */}
      <Box sx={{
        position: 'relative', width: '100%', minHeight: { xs: '600px', md: '750px' },
        display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6,
      }}>
        {/* Background Overlay & Image */}
        <Box sx={{ 
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
          zIndex: 0, overflow: 'hidden', bgcolor: '#000' 
        }}>
          {/* Subtle Ken Burns Animation */}
          <Box 
            component="img" 
            src="/images/hero_final.png" 
            alt="Ocean Background" 
            sx={{ 
              width: '100%', height: '100%', objectFit: 'cover',
              animation: 'kenburns 40s infinite alternate linear',
              '@keyframes kenburns': {
                '0%': { transform: 'scale(1) translate(0, 0)' },
                '100%': { transform: 'scale(1.2) translate(-2%, -2%)' }
              }
            }} 
          />
          <Box sx={{ 
            position: 'absolute', inset: 0, zIndex: 1, 
            background: 'linear-gradient(to bottom, rgba(0,0,30,0.5) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.8) 100%)' 
          }} />
        </Box>

        <Container maxWidth="lg" sx={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <Typography variant="h1" color="white" fontWeight={800} sx={{ 
            fontSize: { xs: '3.5rem', md: '5.5rem' }, mb: 2, 
            textShadow: '0 8px 32px rgba(0,0,0,0.6)',
            letterSpacing: '-0.02em',
            lineHeight: 1.1
          }}>
            Find Your Perfect Cruise
          </Typography>
          <Typography variant="h5" color="rgba(255,255,255,0.95)" mb={6} fontWeight={400} sx={{ 
            textShadow: '0 4px 12px rgba(0,0,0,0.5)',
            maxWidth: '800px', mx: 'auto'
          }}>
            Explore world-class destinations and unparalleled luxury at sea.
          </Typography>

          {/* Search Form */}
          <Paper sx={{ p: 3, borderRadius: 4, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', boxShadow: '0 24px 48px rgba(0,0,0,0.2)' }}>
            <TextField select label="Destination" value={searchDestination} onChange={(e) => setSearchDestination(e.target.value)} sx={{ flex: '1 1 200px' }} InputProps={{ startAdornment: <InputAdornment position="start"><LocationOnIcon color="primary" /></InputAdornment> }}>
              <MenuItem value="">Any Destination</MenuItem>
              <MenuItem value="Caribbean">Caribbean</MenuItem>
              <MenuItem value="Bahamas">Bahamas</MenuItem>
              <MenuItem value="Europe">Europe</MenuItem>
              <MenuItem value="Alaska">Alaska</MenuItem>
            </TextField>

            <TextField select label="Departure Port" value={searchPort} onChange={(e) => setSearchPort(e.target.value)} sx={{ flex: '1 1 200px' }} InputProps={{ startAdornment: <InputAdornment position="start"><DirectionsBoatIcon color="primary" /></InputAdornment> }}>
              <MenuItem value="">Any Port</MenuItem>
              {ports.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
            </TextField>

            <TextField type="month" label="Date" value={searchDate} onChange={(e) => setSearchDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ flex: '1 1 180px' }} InputProps={{ startAdornment: <InputAdornment position="start"><CalendarMonthIcon color="primary" /></InputAdornment> }} />

            <TextField select label="Guests" value={searchGuests} onChange={(e) => setSearchGuests(e.target.value)} sx={{ flex: '1 1 120px' }} InputProps={{ startAdornment: <InputAdornment position="start"><PeopleIcon color="primary" /></InputAdornment> }}>
              {[1, 2, 3, 4, 5, 6].map(n => <MenuItem key={n} value={n.toString()}>{n} Guest{n > 1 ? 's' : ''}</MenuItem>)}
            </TextField>

            <Button variant="contained" color="primary" size="large" onClick={() => fetchCruises()} startIcon={<SearchIcon />} sx={{ height: 56, px: 4, flex: '1 1 150px' }}>
              Search Cruises
            </Button>
          </Paper>
        </Container>
      </Box>

      {/* Popular Destinations Bonus Section */}
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Typography variant="h4" fontWeight={800} mb={4} textAlign="center">Popular Destinations</Typography>
        <Grid container spacing={3}>
          {[{name: 'Caribbean', img: '/images/caribbean.png'}, {name: 'Europe', img: '/images/europe.png'}, {name: 'Alaska', img: '/images/alaska.png'}, {name: 'Asia', img: '/images/asia.png'}].map(dest => (
            <Grid item xs={12} sm={6} md={3} key={dest.name}>
              <Box 
                onClick={() => {
                  setSearchDestination(dest.name);
                  setTimeout(() => fetchCruises(), 0);
                  document.getElementById('cruise-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                sx={{ 
                  position: 'relative', height: 280, borderRadius: 4, overflow: 'hidden', 
                  cursor: 'pointer', boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  '&:hover img': { transform: 'scale(1.1)' } 
                }}
              >
                <Box 
                  component="img" src={dest.img} alt={dest.name} 
                  sx={{ 
                    width: '100%', height: '100%', objectFit: 'cover', 
                    objectPosition: 'center 30%', transition: 'transform 0.6s ease-out' 
                  }} 
                />
                <Box sx={{ 
                  position: 'absolute', inset: 0, 
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)', 
                  display: 'flex', alignItems: 'flex-end', p: 3
                }}>
                  <Typography variant="h5" color="white" fontWeight={800} sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{dest.name}</Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Main Content Layout */}
      <Container maxWidth="xl" sx={{ pb: 8, bgcolor: 'background.default' }}>
        <Grid container spacing={4}>
          
          {/* 3. FILTER SIDEBAR */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, borderRadius: 3, position: 'sticky', top: 20 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight={700}>Filter Cruises</Typography>
                <Button size="small" onClick={handleReset} sx={{ fontWeight: 700 }}>Reset</Button>
              </Box>
              
              <Box mb={4}>
                <Typography variant="subtitle2" fontWeight={700} mb={1}>Price Range (min price/pp)</Typography>
                <Slider value={priceRange} onChange={(_, nv) => setPriceRange(nv as number[])} valueLabelDisplay="auto" min={0} max={10000} step={100} />
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">${priceRange[0]}</Typography>
                  <Typography variant="body2">${priceRange[1]}</Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box mb={4}>
                <Typography variant="subtitle2" fontWeight={700} mb={1}>Duration</Typography>
                <Stack spacing={1}>
                  <FormControlLabel control={<Checkbox checked={filterDuration === 'short'} onChange={() => setFilterDuration('short')} />} label="1-4 Nights" />
                  <FormControlLabel control={<Checkbox checked={filterDuration === 'medium'} onChange={() => setFilterDuration('medium')} />} label="5-8 Nights" />
                  <FormControlLabel control={<Checkbox checked={filterDuration === 'long'} onChange={() => setFilterDuration('long')} />} label="9+ Nights" />
                </Stack>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box mb={4}>
                <Typography variant="subtitle2" fontWeight={700} mb={1}>Vessel Name</Typography>
                <TextField fullWidth size="small" placeholder="e.g. Carnival" value={filterShipName} onChange={e => setFilterShipName(e.target.value)} />
              </Box>

              <Button variant="contained" fullWidth size="large" onClick={() => fetchCruises()} sx={{ mt: 2 }}>
                Apply Filters
              </Button>
            </Paper>
          </Grid>

          {/* 2. CRUISE LISTING SECTION */}
          <Grid item xs={12} md={9} id="cruise-list">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
              <Typography variant="h4" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1, scrollMarginTop: '100px' }}>
                <DirectionsBoatIcon color="primary" fontSize="large" />
                {loading ? 'Finding Cruises…' : `${cruises.length} Cruise${cruises.length !== 1 ? 's' : ''} Found`}
              </Typography>

              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="body2" fontWeight={600}>Sort By:</Typography>
                <TextField select size="small" value={sortBy} onChange={e => setSortBy(e.target.value)} sx={{ minWidth: 150 }}>
                  <MenuItem value="departure_date">Departure Date</MenuItem>
                  <MenuItem value="price">Price (Inside Cabin)</MenuItem>
                  <MenuItem value="duration">Duration</MenuItem>
                </TextField>
                <TextField select size="small" value={sortOrder} onChange={e => setSortOrder(e.target.value as any)}>
                  <MenuItem value="ASC">Low to High</MenuItem>
                  <MenuItem value="DESC">High to Low</MenuItem>
                </TextField>
              </Box>
            </Box>

            <Grid container spacing={3}>
              {loading ? (
                Array.from({ length: 9 }).map((_, i) => (
                  <Grid item xs={12} sm={6} lg={4} key={i}>
                    <Skeleton variant="rectangular" height={440} sx={{ borderRadius: 2 }} />
                  </Grid>
                ))
              ) : cruises.length === 0 ? (
                <Grid item xs={12}>
                  <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 4 }}>
                    <SearchIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                    <Typography color="text.secondary" variant="h6">
                      No cruises found matching your filters.
                    </Typography>
                    <Button onClick={handleReset} sx={{ mt: 2 }}>Clear all filters</Button>
                  </Paper>
                </Grid>
              ) : (
                cruises.map((c) => (
                  <Grid item xs={12} sm={6} lg={4} key={c.id}>
                    <CruiseCard cruise={c} />
                  </Grid>
                ))
              )}
            </Grid>
          </Grid>

        </Grid>
      </Container>
      
      {/* Recommended Area Bonus */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="xl">
          <Typography variant="h4" fontWeight="bold" textAlign="center" mb={4}>Guest Favorites</Typography>
          <Grid container spacing={3}>
            {(loading ? Array.from({length:3}) : (cruises.length > 0 ? cruises.slice(0, 3) : [])).map((c, idx) => (
              <Grid item xs={12} md={4} key={c?.id || idx}>
                 <Paper sx={{ p: 2, borderRadius: 4, display: 'flex', gap: 3, alignItems: 'center', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(0,0,0,0.1)' } }}>
                    {loading ? (
                      <Skeleton variant="rectangular" width={100} height={100} sx={{ borderRadius: 2 }} />
                    ) : (
                      <Box component="img" src={c.imageUrl || '/images/IMG-20260326-WA0006.jpg'} sx={{ width: 100, height: 100, borderRadius: 3, objectFit: 'cover', flexShrink: 0 }} />
                    )}
                    <Box sx={{ flexGrow: 1 }}>
                      {loading ? (
                        <>
                          <Skeleton width="80%" height={24} />
                          <Skeleton width="40%" height={20} />
                        </>
                      ) : (
                        <>
                          <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.2, mb: 0.5 }}>{c.name}</Typography>
                          <Rating value={4.5 + (idx * 0.1)} precision={0.5} readOnly size="small" />
                          <Typography variant="h6" color="primary.main" fontWeight={800} mt={1}>From ${getPrice(c)}</Typography>
                        </>
                      )}
                    </Box>
                 </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      {/* AI CHAT WIDGET */}
<Box
  sx={{
    position: 'fixed',
    bottom: 20,
    right: 20,
    zIndex: 2000,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 1,
  }}
>
  {open && <AiChatPanel />}

  <Button
    variant="contained"
    onClick={() => setOpen(!open)}
    sx={{
      borderRadius: '999px',
      px: 3,
      boxShadow: '0 8px 20px rgba(0,0,0,0.25)'
    }}
  >
    {open ? 'Close' : 'AI Assistant'}
  </Button>
</Box>	
    </Box>
  );
} 