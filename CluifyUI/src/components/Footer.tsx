import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const Footer = ({ darkMode }: { darkMode: boolean }) => (
  <Box component="footer" sx={{
    width: '100%',
    textAlign: 'center',
    position: 'fixed',
    bottom: 0,
    left: 0,
    zIndex: 10,
    fontSize: { xs: 9, sm: 11 },
    color: darkMode ? '#888' : '#888',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: { xs: 0.5, sm: 1 },
    letterSpacing: 0.1,
    lineHeight: 1.3,
    userSelect: 'none',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    boxShadow: 'none',
    p: 0.5,
    maxHeight: { xs: '2.5em', sm: 'auto' },
    overflowY: { xs: 'auto', sm: 'visible' },
  }}>
    <Typography component="span" sx={{ fontSize: 'inherit' }}>
      © {new Date().getFullYear()} Cluify. All rights reserved.
    </Typography>
    <Typography component="span" sx={{ mx: 0.5, opacity: 0.7, display: { xs: 'none', sm: 'inline' } }}>|</Typography>
    <Link href="https://asantaems.com" underline="hover" color="inherit" sx={{ fontSize: 'inherit', mx: { xs: 0, sm: 0.5 } }} target="_blank" rel="noopener noreferrer">
      Portfolio
    </Link>
    <Typography component="span" sx={{ mx: 0.5, opacity: 0.7, display: { xs: 'none', sm: 'inline' } }}>|</Typography>
    <Link href="#" underline="hover" color="inherit" sx={{ fontSize: 'inherit', mx: { xs: 0, sm: 0.5 } }}>
      Terms of Service
    </Link>
    <Typography component="span" sx={{ mx: 0.5, opacity: 0.7, display: { xs: 'none', sm: 'inline' } }}>|</Typography>
    <Link href="#" underline="hover" color="inherit" sx={{ fontSize: 'inherit', mx: { xs: 0, sm: 0.5 } }}>
      Privacy Policy
    </Link>
  </Box>
);

export default Footer; 