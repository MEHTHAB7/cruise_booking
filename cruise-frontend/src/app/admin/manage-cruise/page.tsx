'use client';
import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Paper, Grid, TextField, Button,
  Tabs, Tab, Alert, CircularProgress, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { cruisesApi, portsApi, shipsApi, roomsApi, restaurantsApi, showsApi, casinoApi, packagesApi } from '@/lib/api';
import { useSnackbar } from 'notistack';

function TabPanel(props: any) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && (<Box sx={{ p: 3 }}>{children}</Box>)}
    </div>
  );
}

export default function ManageCruisePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const [ships, setShips] = useState<any[]>([]);
  const [ports, setPorts] = useState<any[]>([]);
  const [cruises, setCruises] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    } else if (user?.role === 'admin') {
      fetchInitialData();
    }
  }, [user, authLoading]);

  const fetchInitialData = async () => {
    try {
      const [shRes, ptRes, crRes] = await Promise.all([
        shipsApi.getAll(),
        portsApi.getAll(),
        cruisesApi.search() 
      ]);

      const extract = (res: any) => (res && res.value && Array.isArray(res.value)) ? res.value : (Array.isArray(res) ? res : []);

      setShips(extract(shRes));
      setPorts(extract(ptRes));
      setCruises(extract(crRes));
    } catch (err) {
      console.error(err);
    }
  };

  // ================= CRUISE FORM =================
  const [cruiseForm, setCruiseForm] = useState({
    name: '', shipId: '', departurePortId: '', destinationPortId: '',
    departureDate: '', returnDate: '', description: '', imageUrl: '',
    basePriceInside: 0, basePriceOceanView: 0, basePriceBalcony: 0, basePriceSuite: 0,
    highlights: '', portsOfCall: ''
  });

  const handleCreateCruise = async () => {
    try {
      setLoading(true);
      const payload = {
        ...cruiseForm,
        highlights: cruiseForm.highlights.split(',').map(s => s.trim()),
        portsOfCall: cruiseForm.portsOfCall.split(',').map(s => s.trim()),
        status: 'active'
      };
      await cruisesApi.create(payload);
      enqueueSnackbar('Cruise created successfully!', { variant: 'success' });
      fetchInitialData();
    } catch (e: any) {
      enqueueSnackbar(e.message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // ================= ROOMS FORM =================
  const [roomForm, setRoomForm] = useState({
    shipId: '', type: 'inside', roomNumber: '', deck: 1,
    maxOccupancy: 2, sizeSqft: 200, imageUrl: ''
  });

  const handleCreateRoom = async () => {
    try {
      setLoading(true);
      await roomsApi.create({ ...roomForm, status: 'available', amenities: ['TV', 'AC'] });
      enqueueSnackbar('Room created successfully!', { variant: 'success' });
    } catch (e: any) {
      enqueueSnackbar(e.message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // ================= PACKAGES FORM =================
  const [pkgForm, setPkgForm] = useState({
    cruiseId: '', title: '', description: '', price: 0, durationDays: 7,
    images: '', facilities: ''
  });
  const [itinerary, setItinerary] = useState([{ day: 1, title: '', desc: '' }]);

  const handleAddItineraryDay = () => {
    setItinerary([...itinerary, { day: itinerary.length + 1, title: '', desc: '' }]);
  };

  const handleRemoveItineraryDay = (index: number) => {
    const nextArr = itinerary.filter((_, i) => i !== index).map((day, i) => ({ ...day, day: i + 1 }));
    setItinerary(nextArr);
  };

  const handleCreatePackage = async () => {
    try {
      setLoading(true);
      if (!pkgForm.cruiseId) throw new Error('Please select a cruise.');
      
      const payload = {
        ...pkgForm,
        images: pkgForm.images.split(',').map(s => s.trim()).filter(s => s),
        facilities: pkgForm.facilities.split(',').map(s => s.trim()).filter(s => s),
        itinerary
      };
      await packagesApi.create(payload);
      enqueueSnackbar('Package created successfully!', { variant: 'success' });
    } catch (e: any) {
      enqueueSnackbar(e.message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // ================= ACTIVITIES FORM =================
  const [activityType, setActivityType] = useState('show');
  const [actCruiseId, setActCruiseId] = useState('');
  
  // Show / Casino / Dining shared
  const [actForm, setActForm] = useState({
    name: '', showDate: '', eventDate: '', startTime: '', endTime: '', durationMinutes: 60,
    capacity: 100, minAge: 18, imageUrl: '', gameType: 'Slots', mealSlot: 'dinner', description: ''
  });

  const handleCreateActivity = async () => {
    try {
      setLoading(true);
      if (!actCruiseId) throw new Error('Please select a cruise.');
      
      const payload: any = { ...actForm, cruiseId: actCruiseId };
      if (activityType === 'show') {
         payload.showDate = actForm.eventDate || new Date().toISOString();
         await showsApi.create(payload);
      } else if (activityType === 'casino') {
         payload.eventDate = actForm.eventDate || new Date().toISOString();
         payload.buyInUsd = 10;
         await casinoApi.create(payload);
      } else if (activityType === 'restaurant') {
         const targetCruise = cruises.find(c => c.id === actCruiseId);
         if (!targetCruise || !targetCruise.ship) throw new Error('Selected cruise has no ship.');
         
         const newRest = await restaurantsApi.create({
           name: actForm.name,
           shipId: targetCruise.ship.id,
           imageUrl: actForm.imageUrl
         });
         
         await restaurantsApi.createSlot({
           restaurantId: newRest.id,
           cruiseId: actCruiseId,
           mealSlot: actForm.mealSlot,
           slotDate: actForm.eventDate || new Date().toISOString(),
           startTime: actForm.startTime,
           endTime: actForm.endTime || "22:00",
           capacity: actForm.capacity
         });
      }
      enqueueSnackbar(`${activityType} created successfully!`, { variant: 'success' });
    } catch (e: any) {
      enqueueSnackbar(e.message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <CircularProgress />;

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h4" fontWeight={800} mb={4}>Manage System Entities</Typography>
      
      <Paper sx={{ mb: 4 }}>
        <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} indicatorColor="primary" textColor="primary" variant="fullWidth">
          <Tab label="Add New Cruise" />
          <Tab label="Add Rooms" />
          <Tab label="Add Activities" />
          <Tab label="Add Package" />
        </Tabs>
      </Paper>

      <Paper sx={{ p: 4 }}>
        {/* ------- C R U I S E ------- */}
        <TabPanel value={tabIndex} index={0}>
          <Typography variant="h5" mb={3} fontWeight={700}>Create New Cruise</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}><TextField fullWidth label="Cruise Name" value={cruiseForm.name} onChange={e => setCruiseForm({...cruiseForm, name: e.target.value})} /></Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Ship</InputLabel>
                <Select value={cruiseForm.shipId} label="Ship" onChange={e => setCruiseForm({...cruiseForm, shipId: e.target.value})}>
                  {ships.map(s => <MenuItem value={s.id} key={s.id}>{s.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Image URL" value={cruiseForm.imageUrl} onChange={e => setCruiseForm({...cruiseForm, imageUrl: e.target.value})} /></Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Departure Port</InputLabel>
                <Select value={cruiseForm.departurePortId} label="Departure Port" onChange={e => setCruiseForm({...cruiseForm, departurePortId: e.target.value})}>
                  {ports.map(p => <MenuItem value={p.id} key={p.id}>{p.name} ({p.city})</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Destination Port</InputLabel>
                <Select value={cruiseForm.destinationPortId} label="Destination Port" onChange={e => setCruiseForm({...cruiseForm, destinationPortId: e.target.value})}>
                  {ports.map(p => <MenuItem value={p.id} key={p.id}>{p.name} ({p.city})</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}><TextField fullWidth type="date" label="Departure Date" InputLabelProps={{ shrink: true }} value={cruiseForm.departureDate} onChange={e => setCruiseForm({...cruiseForm, departureDate: e.target.value})} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth type="date" label="Return Date" InputLabelProps={{ shrink: true }} value={cruiseForm.returnDate} onChange={e => setCruiseForm({...cruiseForm, returnDate: e.target.value})} /></Grid>
            
            <Grid item xs={6} sm={3}><TextField fullWidth type="number" label="Price Inside" value={cruiseForm.basePriceInside} onChange={e => setCruiseForm({...cruiseForm, basePriceInside: +e.target.value})} /></Grid>
            <Grid item xs={6} sm={3}><TextField fullWidth type="number" label="Price OceanView" value={cruiseForm.basePriceOceanView} onChange={e => setCruiseForm({...cruiseForm, basePriceOceanView: +e.target.value})} /></Grid>
            <Grid item xs={6} sm={3}><TextField fullWidth type="number" label="Price Balcony" value={cruiseForm.basePriceBalcony} onChange={e => setCruiseForm({...cruiseForm, basePriceBalcony: +e.target.value})} /></Grid>
            <Grid item xs={6} sm={3}><TextField fullWidth type="number" label="Price Suite" value={cruiseForm.basePriceSuite} onChange={e => setCruiseForm({...cruiseForm, basePriceSuite: +e.target.value})} /></Grid>

            <Grid item xs={12}><TextField fullWidth label="Description" multiline rows={2} value={cruiseForm.description} onChange={e => setCruiseForm({...cruiseForm, description: e.target.value})} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Ports of Call (comma separated)" value={cruiseForm.portsOfCall} onChange={e => setCruiseForm({...cruiseForm, portsOfCall: e.target.value})} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Highlights (comma separated)" value={cruiseForm.highlights} onChange={e => setCruiseForm({...cruiseForm, highlights: e.target.value})} /></Grid>

            <Grid item xs={12} mt={2}>
              <Button variant="contained" size="large" onClick={handleCreateCruise} disabled={loading || !cruiseForm.name}>Create Cruise</Button>
            </Grid>
          </Grid>
        </TabPanel>

        {/* ------- R O O M S ------- */}
        <TabPanel value={tabIndex} index={1}>
          <Typography variant="h5" mb={3} fontWeight={700}>Add Cabin/Room</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Ship</InputLabel>
                <Select value={roomForm.shipId} label="Ship" onChange={e => setRoomForm({...roomForm, shipId: e.target.value})}>
                  {ships.map(s => <MenuItem value={s.id} key={s.id}>{s.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Room Type</InputLabel>
                <Select value={roomForm.type} label="Room Type" onChange={e => setRoomForm({...roomForm, type: e.target.value})}>
                  <MenuItem value="inside">Inside</MenuItem>
                  <MenuItem value="ocean_view">Ocean View</MenuItem>
                  <MenuItem value="balcony">Balcony</MenuItem>
                  <MenuItem value="suite">Suite</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Room Number (e.g. 401A)" value={roomForm.roomNumber} onChange={e => setRoomForm({...roomForm, roomNumber: e.target.value})} /></Grid>
            <Grid item xs={6} sm={3}><TextField fullWidth type="number" label="Deck" value={roomForm.deck} onChange={e => setRoomForm({...roomForm, deck: +e.target.value})} /></Grid>
            <Grid item xs={6} sm={3}><TextField fullWidth type="number" label="Max Occupancy" value={roomForm.maxOccupancy} onChange={e => setRoomForm({...roomForm, maxOccupancy: +e.target.value})} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Image URL" value={roomForm.imageUrl} onChange={e => setRoomForm({...roomForm, imageUrl: e.target.value})} /></Grid>

            <Grid item xs={12} mt={2}>
              <Button variant="contained" size="large" onClick={handleCreateRoom} disabled={loading || !roomForm.roomNumber}>Add Room</Button>
            </Grid>
          </Grid>
        </TabPanel>

        {/* ------- A C T I V I T I E S & D I N I N G ------- */}
        <TabPanel value={tabIndex} index={2}>
          <Typography variant="h5" mb={3} fontWeight={700}>Add Onboard Activity or Dining</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Target Cruise</InputLabel>
                <Select value={actCruiseId} label="Target Cruise" onChange={e => setActCruiseId(e.target.value)}>
                  {cruises.map(c => <MenuItem value={c.id} key={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select value={activityType} label="Category" onChange={e => setActivityType(e.target.value)}>
                  <MenuItem value="show">Theatre & Show</MenuItem>
                  <MenuItem value="casino">Casino Event</MenuItem>
                  <MenuItem value="restaurant">Restaurant Dining Slot</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {activityType !== 'restaurant' ? (
              <>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Activity Name (e.g. Magic Show)" value={actForm.name} onChange={e => setActForm({...actForm, name: e.target.value})} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Image URL" value={actForm.imageUrl} onChange={e => setActForm({...actForm, imageUrl: e.target.value})} /></Grid>
                
                <Grid item xs={12} sm={6}><TextField fullWidth type="date" label="Date" InputLabelProps={{ shrink: true }} value={actForm.eventDate} onChange={e => setActForm({...actForm, eventDate: e.target.value})} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth type="time" label="Time" InputLabelProps={{ shrink: true }} value={actForm.startTime} onChange={e => setActForm({...actForm, startTime: e.target.value})} /></Grid>

                <Grid item xs={6} sm={3}><TextField fullWidth type="number" label="Capacity" value={actForm.capacity} onChange={e => setActForm({...actForm, capacity: +e.target.value})} /></Grid>
                <Grid item xs={6} sm={3}><TextField fullWidth type="number" label="Duration (mins)" value={actForm.durationMinutes} onChange={e => setActForm({...actForm, durationMinutes: +e.target.value})} /></Grid>

                {activityType === 'casino' && (
                  <Grid item xs={12} sm={6}><TextField fullWidth label="Game Type (e.g. Poker)" value={actForm.gameType} onChange={e => setActForm({...actForm, gameType: e.target.value})} /></Grid>
                )}

                <Grid item xs={12}><TextField fullWidth label="Description" multiline rows={2} value={actForm.description} onChange={e => setActForm({...actForm, description: e.target.value})} /></Grid>

                <Grid item xs={12} mt={2}>
                  <Button variant="contained" size="large" onClick={handleCreateActivity} disabled={loading || !actForm.name || !actCruiseId}>Add Activity</Button>
                </Grid>
              </>
            ) : (
              <>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Restaurant Name" value={actForm.name} onChange={e => setActForm({...actForm, name: e.target.value})} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Image URL" value={actForm.imageUrl} onChange={e => setActForm({...actForm, imageUrl: e.target.value})} /></Grid>
                
                <Grid item xs={12} sm={6}><TextField fullWidth type="date" label="Date" InputLabelProps={{ shrink: true }} value={actForm.eventDate} onChange={e => setActForm({...actForm, eventDate: e.target.value})} /></Grid>
                <Grid item xs={6} sm={3}><TextField fullWidth type="time" label="Start Time" InputLabelProps={{ shrink: true }} value={actForm.startTime} onChange={e => setActForm({...actForm, startTime: e.target.value})} /></Grid>
                <Grid item xs={6} sm={3}><TextField fullWidth type="time" label="End Time (HH:mm)" InputLabelProps={{ shrink: true }} value={actForm.description /* using desc as endTime hack */} onChange={e => setActForm({...actForm, description: e.target.value})} /></Grid>
                
                <Grid item xs={12} sm={6}><TextField fullWidth type="number" label="Capacity" value={actForm.capacity} onChange={e => setActForm({...actForm, capacity: +e.target.value})} /></Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Meal Slot Type</InputLabel>
                    <Select value={actForm.gameType /* using gameType for meal slot type hack */} label="Meal Slot Type" onChange={e => setActForm({...actForm, gameType: e.target.value})}>
                      <MenuItem value="breakfast">Breakfast</MenuItem>
                      <MenuItem value="lunch">Lunch</MenuItem>
                      <MenuItem value="dinner">Dinner</MenuItem>
                      <MenuItem value="special_tasting">Special Tasting</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} mt={2}>
                  <Button variant="contained" size="large" onClick={handleCreateActivity} disabled={loading || !actForm.name || !actCruiseId}>Add Dining Slot</Button>
                </Grid>
              </>
            )}
          </Grid>
        </TabPanel>
        {/* ------- P A C K A G E S ------- */}
        <TabPanel value={tabIndex} index={3}>
          <Typography variant="h5" mb={3} fontWeight={700}>Create Custom Package</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Target Cruise</InputLabel>
                <Select value={pkgForm.cruiseId} label="Target Cruise" onChange={e => setPkgForm({...pkgForm, cruiseId: e.target.value})}>
                  {cruises.map(c => <MenuItem value={c.id} key={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Package Title (e.g. 5-Day Luxury)" value={pkgForm.title} onChange={e => setPkgForm({...pkgForm, title: e.target.value})} /></Grid>
            
            <Grid item xs={12}><TextField fullWidth label="Description" multiline rows={2} value={pkgForm.description} onChange={e => setPkgForm({...pkgForm, description: e.target.value})} /></Grid>
            
            <Grid item xs={6} sm={3}><TextField fullWidth type="number" label="Duration (Days)" value={pkgForm.durationDays} onChange={e => setPkgForm({...pkgForm, durationDays: +e.target.value})} /></Grid>
            <Grid item xs={6} sm={3}><TextField fullWidth type="number" label="Price (Total)" value={pkgForm.price} onChange={e => setPkgForm({...pkgForm, price: +e.target.value})} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Image URLs (comma separated)" value={pkgForm.images} onChange={e => setPkgForm({...pkgForm, images: e.target.value})} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Facilities (comma separated)" value={pkgForm.facilities} onChange={e => setPkgForm({...pkgForm, facilities: e.target.value})} /></Grid>

            <Grid item xs={12} mt={3}>
              <Typography variant="h6" fontWeight={700} mb={2}>Itinerary Builder</Typography>
              {itinerary.map((day, idx) => (
                <Paper key={idx} variant="outlined" sx={{ p: 2, mb: 2, position: 'relative' }}>
                  <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>Day {day.day}</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <TextField fullWidth size="small" label="Day Title" value={day.title} onChange={e => {
                        const next = [...itinerary]; next[idx].title = e.target.value; setItinerary(next);
                      }} />
                    </Grid>
                    <Grid item xs={12} sm={7}>
                      <TextField fullWidth size="small" label="Day Description" value={day.desc} onChange={e => {
                        const next = [...itinerary]; next[idx].desc = e.target.value; setItinerary(next);
                      }} />
                    </Grid>
                    <Grid item xs={12} sm={1} display="flex" alignItems="center">
                      <Button color="error" onClick={() => handleRemoveItineraryDay(idx)} disabled={itinerary.length === 1}>X</Button>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
              <Button variant="outlined" startIcon={<span>+</span>} onClick={handleAddItineraryDay}>Add Day</Button>
            </Grid>

            <Grid item xs={12} mt={4}>
              <Button variant="contained" size="large" onClick={handleCreatePackage} disabled={loading || !pkgForm.title || !pkgForm.cruiseId}>Create Package</Button>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Container>
  );
}
