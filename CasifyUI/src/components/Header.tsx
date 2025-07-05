import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import { Box, Typography } from '@mui/material';
import HowToPlayModal from '../modals/HowToPlayModal';

const ICON_SIZE = 32;

const Header = ({ darkMode, onSettings, onPractice }: { darkMode: boolean; onSettings: () => void; onPractice: () => void; }) => {
  const [howToOpen, setHowToOpen] = useState(false);
  // Placeholder user logic
  const user: { username: string } | null = null;

  return (
    <>
      <AppBar position="static" color="transparent" elevation={0} sx={{ border: 0, boxShadow: 'none', background: darkMode ? '#181818' : '#fff', borderBottom: `1px solid ${darkMode ? '#333' : '#eee'}` }}>
        <Toolbar sx={{ minHeight: 56, px: { xs: 1, sm: 2 }, display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: ICON_SIZE, marginRight: 8 }} role="img" aria-label="game icon">🕵️‍♂️</span>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
            <IconButton aria-label="How to play" color="inherit" size="large" onClick={() => setHowToOpen(true)}>
              <HelpOutlineIcon sx={{ color: darkMode ? '#fff' : '#222', fontSize: ICON_SIZE }} />
            </IconButton>
            {user && (
              <IconButton aria-label="Stats" color="inherit" size="large">
                <BarChartIcon sx={{ color: darkMode ? '#fff' : '#222', fontSize: ICON_SIZE }} />
              </IconButton>
            )}
            <IconButton aria-label="Settings" color="inherit" size="large" onClick={onSettings}>
              <SettingsIcon sx={{ color: darkMode ? '#fff' : '#222', fontSize: ICON_SIZE }} />
            </IconButton>
            <Button
                variant="outlined"
                onClick={onPractice}
                sx={{
                  color: darkMode ? '#fff' : '#222',
                  borderColor: darkMode ? '#fff' : '#222',
                  borderRadius: '20px',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  py: 0.5,
                  px: 2,
                  ml: 1,
                  '&:hover': {
                    backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)',
                    borderColor: darkMode ? '#fff' : '#222',
                  },
                }}
              >
                Practice
              </Button>
            {user ? (
              <Typography sx={{ color: darkMode ? '#fff' : '#222', fontWeight: 600, fontSize: 18, ml: { xs: 1, sm: 2 } }}>
                {user.username}
              </Typography>
            ) : (
              <Button
                variant="outlined"
                sx={{
                  color: darkMode ? '#fff' : '#222',
                  borderColor: darkMode ? '#fff' : '#222',
                  borderRadius: '20px',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  py: 0.5,
                  px: 2,
                  ml: 1,
                  '&:hover': {
                    backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)',
                    borderColor: darkMode ? '#fff' : '#222',
                  },
                }}
              >
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <HowToPlayModal open={howToOpen} onClose={() => setHowToOpen(false)} darkMode={darkMode} />
    </>
  );
};

export default Header;