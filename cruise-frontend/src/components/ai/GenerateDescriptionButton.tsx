'use client';

import { useState } from 'react';
import { Button } from '@mui/material';
import { aiApi } from '@/lib/api';

interface Props {
  onGenerated: (text: string) => void;
  context?: string; // optional extra data
}

export default function GenerateDescriptionButton({ onGenerated, context }: Props) {
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);

    try {
      const res = await aiApi.chat(
        `Generate a luxury cruise description. ${context || ''}`
      );

      if (res?.reply) {
        onGenerated(res.reply);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to generate description');
    }

    setLoading(false);
  };

  return (
    <Button
      variant="outlined"
      onClick={generate}
      disabled={loading}
    >
      {loading ? 'Generating...' : 'Generate Description (AI)'}
    </Button>
  );
}