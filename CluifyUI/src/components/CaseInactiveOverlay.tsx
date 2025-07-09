import React from 'react';
import { Box, Typography, Button } from '@mui/material';

const CaseInactiveOverlay: React.FC<{ onClose?: () => void }> = ({ onClose }) => (
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
      Case no longer active
    </Typography>
    <Button variant="contained" color="primary" sx={{ mt: 4 }} onClick={onClose}>
      Return to Main Menu
    </Button>
  </Box>
);

export default CaseInactiveOverlay; 