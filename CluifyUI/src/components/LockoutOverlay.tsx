import React from 'react';
import { Box, Typography, Button } from '@mui/material';

const LockoutOverlay: React.FC<{ onReturn?: () => void }> = ({ onReturn }) => (
  <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      bgcolor: 'rgba(0,0,0,0.85)',
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
    }}
  >
    <Typography variant="h3" fontWeight="bold" gutterBottom>
      Thanks for playing today!
    </Typography>
    <Button variant="contained" color="primary" sx={{ mt: 4 }} onClick={onReturn}>
      Return
    </Button>
  </Box>
);

export default LockoutOverlay; 