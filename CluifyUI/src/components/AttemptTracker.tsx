import React from 'react';
import { Box } from '@mui/material';

export type AttemptStatus = 'empty' | 'incorrect' | 'correct';

interface AttemptTrackerProps {
  attempts: AttemptStatus[]; // length up to 5
}

const getColor = (status: AttemptStatus) => {
  switch (status) {
    case 'correct':
      return { bg: '#388e3c', border: '#388e3c' };
    case 'incorrect':
      return { bg: '#b71c1c', border: '#b71c1c' };
    default:
      return { bg: '#222', border: '#444' };
  }
};

const AttemptTracker: React.FC<AttemptTrackerProps> = ({ attempts }) => {
  // Always show 5 boxes
  const padded = [...attempts, ...Array(5 - attempts.length).fill('empty')].slice(0, 5);
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
      {padded.map((status, idx) => {
        const { bg, border } = getColor(status as AttemptStatus);
        return (
          <Box
            key={idx}
            sx={{
              width: 16,
              height: 16,
              minWidth: 16,
              minHeight: 16,
              borderRadius: '4px',
              background: bg,
              border: `2px solid ${border}`,
              display: 'inline-block',
              transition: 'background 0.2s, border 0.2s',
            }}
          />
        );
      })}
    </Box>
  );
};

export default AttemptTracker; 