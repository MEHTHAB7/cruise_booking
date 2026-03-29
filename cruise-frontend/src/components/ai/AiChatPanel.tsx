'use client';

import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Stack,
  Paper
} from '@mui/material';
import { aiApi } from '@/lib/api';

export default function AiChatPanel({ cruiseId }: { cruiseId?: string }) {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages((prev) => [...prev, `You: ${userMessage}`]);
    setLoading(true);

    try {
      const res = await aiApi.chat(userMessage, cruiseId);
      setMessages((prev) => [...prev, `AI: ${res.reply || 'No response'}`]);
    } catch {
      setMessages((prev) => [...prev, 'AI: Error occurred']);
    }

    setLoading(false);
  };

  return (
    <Paper
      elevation={6}
      sx={{
        width: 360, // ✅ wider
        height: 450,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
        <Typography fontWeight={600}>AI Assistant</Typography>
      </Box>

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          bgcolor: '#fafafa'
        }}
      >
        <Stack spacing={1}>
          {messages.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              Ask me about cruises, activities, or bookings...
            </Typography>
          )}

          {messages.map((msg, i) => (
            <Box
              key={i}
              sx={{
                p: 1,
                borderRadius: 2,
                bgcolor: msg.startsWith('You:')
                  ? '#e3f2fd'
                  : '#eeeeee'
              }}
            >
              <Typography variant="body2">{msg}</Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Input */}
      <Box
        sx={{
          p: 1.5,
          borderTop: '1px solid #eee',
          display: 'flex',
          gap: 1
        }}
      >
        <TextField
          size="small"
          fullWidth
          placeholder="Type your question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              sendMessage();
            }
          }}
          sx={{
            '& input': {
              padding: '10px' // ✅ FIX clipping
            }
          }}
        />

        <Button
          variant="contained"
          onClick={sendMessage}
          disabled={loading}
        >
          {loading ? '...' : 'Send'}
        </Button>
      </Box>
    </Paper>
  );
}