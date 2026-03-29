'use client';

import { useState } from 'react';
import { Box, Button, Typography, Stack, Paper } from '@mui/material';
import { aiApi } from '@/lib/api';

export default function AiRecommendations({ cruiseId }: { cruiseId?: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const getRecommendations = async () => {
    setLoading(true);
    try {
      const res = await aiApi.chat(
        'Recommend best activities, shows, and restaurants for this cruise',
        cruiseId
      );
      setResult(res.reply);
    } catch (err) {
      console.error(err);
      setResult('Failed to get recommendations');
    }
    setLoading(false);
  };

  return (
    <Paper sx={{ p: 2, borderRadius: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h6">AI Recommendations</Typography>

        <Button
          variant="contained"
          onClick={getRecommendations}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Get Recommendations'}
        </Button>

        {result && (
          <Box
            sx={{
              p: 2,
              bgcolor: '#f5f5f5',
              borderRadius: 2,
              whiteSpace: 'pre-wrap'
            }}
          >
            <Typography variant="body2">{result}</Typography>
          </Box>
        )}
      </Stack>
    </Paper>
  );
}