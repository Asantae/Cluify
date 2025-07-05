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
    fontSize: 11,
    color: darkMode ? '#888' : '#888',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 1,
    letterSpacing: 0.1,
    lineHeight: 1.3,
    userSelect: 'none',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    boxShadow: 'none',
    p: 0.5
  }}>
    <Typography component="span" sx={{ fontSize: 11 }}>
      © {new Date().getFullYear()} Casify. All rights reserved.
    </Typography>
    <Typography component="span" sx={{ mx: 0.5, opacity: 0.7 }}>|</Typography>
    <Link href="https://asantaems.com" underline="hover" color="inherit" sx={{ fontSize: 11, mx: 0.5 }} target="_blank" rel="noopener noreferrer">
      Portfolio
    </Link>
    <Typography component="span" sx={{ mx: 0.5, opacity: 0.7 }}>|</Typography>
    <Link href="#" underline="hover" color="inherit" sx={{ fontSize: 11, mx: 0.5 }}>
      Terms of Service
    </Link>
    <Typography component="span" sx={{ mx: 0.5, opacity: 0.7 }}>|</Typography>
    <Link href="#" underline="hover" color="inherit" sx={{ fontSize: 11, mx: 0.5 }}>
      Privacy Policy
    </Link>
  </Box>
);

export default Footer; 