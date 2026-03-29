import { Box, Container, Grid, Typography, Button, Paper } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircleIcon from '@mui/icons-material/Circle';
import Link from 'next/link';
import BookingWidget from './BookingWidget';
import { getCruisePackages } from '@/app/utils/packageData';

export default async function PackageDetailsPage({ params }: { params: { id: string, packageId: string } }) {
  const { id, packageId } = params;
  
  // Fetch cruise & package
  const [cruiseRes, pkgRes] = await Promise.all([
    fetch(`http://localhost:3001/api/cruises/${id}`, { cache: 'no-store' }),
    fetch(`http://localhost:3001/api/packages/${packageId}`, { cache: 'no-store' })
  ]);

  if (!cruiseRes.ok || !pkgRes.ok) return <Container sx={{py: 8}}><Typography>Package or Cruise not found.</Typography></Container>;

  const cruise = await cruiseRes.json();
  const pkg = await pkgRes.json();
  
  if (!pkg || !cruise) return <Container sx={{py: 8}}><Typography>Invalid Package Data.</Typography></Container>;

  return (
    <Box sx={{ bgcolor: 'background.default', pb: 8, pt: 8 }}>
      <Container maxWidth="xl">
        <Button component={Link} href={`/cruises/${cruise.id}`} sx={{ mb: 4 }}>
          &larr; Back to {cruise.name}
        </Button>
        <Typography variant="h3" fontWeight={800} mb={1}>{pkg.title}</Typography>
        <Typography variant="subtitle1" color="text.secondary" mb={4}>{cruise.ship?.name} • {pkg.durationDays} Days Itinerary</Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            {/* Image Gallery */}
            <Box mb={4}>
               <Box component="img" src={pkg.images?.[0]} sx={{ width: '100%', height: 400, objectFit: 'cover', borderRadius: 3, mb: 2 }} />
               <Grid container spacing={2}>
                 {pkg.images?.slice(1).map((img: string, idx: number) => (
                   <Grid item xs={6} key={idx}>
                     <Box component="img" src={img} sx={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 3 }} />
                   </Grid>
                 ))}
               </Grid>
            </Box>

            {/* Description & Facilities */}
            <Paper sx={{ p: 4, borderRadius: 3, mb: 4 }}>
              <Typography variant="h5" fontWeight={700} mb={2}>Package Description</Typography>
              <Typography variant="body1" color="text.secondary" lineHeight={1.8} mb={4}>{pkg.description}</Typography>

              <Typography variant="h5" fontWeight={700} mb={2}>Included in this Package</Typography>
              <Grid container spacing={2}>
                {pkg.facilities?.map((fac: string) => (
                  <Grid item xs={12} sm={6} key={fac}>
                    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon color="primary" fontSize="small" /> {fac}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* Itinerary Timeline */}
            <Paper sx={{ p: 4, borderRadius: 3, mb: 4 }}>
              <Typography variant="h5" fontWeight={700} mb={3}>Itinerary Timeline</Typography>
              <Box sx={{ ml: 1, borderLeft: '2px solid', borderColor: 'grey.300', pl: 3, position: 'relative' }}>
                {pkg.itinerary?.map((it: any, idx: number) => (
                  <Box key={it.day} sx={{ mb: idx === (pkg.itinerary?.length || 0) - 1 ? 0 : 4, position: 'relative' }}>
                    <CircleIcon sx={{ position: 'absolute', left: -34, top: 0, color: 'primary.main', fontSize: 16, bgcolor: 'white', borderRadius: '50%' }} />
                    <Typography variant="subtitle1" fontWeight={700} color="primary.main">Day {it.day}: {it.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{it.desc}</Typography>
                  </Box>
                ))}
              </Box>
            </Paper>

          </Grid>

          {/* Booking Widget Column */}
          <Grid item xs={12} md={4}>
             <BookingWidget cruiseId={id} packageId={packageId} price={pkg.price} />
          </Grid>

        </Grid>
      </Container>
    </Box>
  );
}
