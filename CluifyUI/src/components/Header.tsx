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
import investigatorIcon from '../assets/cluify_investigator_icon.png';

const Header = ({ onSettings, onPractice, darkMode }: { onSettings: () => void; onPractice: () => void; darkMode: boolean; }) => {
  const [howToOpen, setHowToOpen] = useState(false);
  // Placeholder user logic
  const user: { username: string } | null = null;

  return (
    <>
      <AppBar position="static" color="transparent" elevation={0} sx={{ border: 0, boxShadow: 'none', borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar sx={{ minHeight: 56, px: { xs: 1, sm: 2 }, display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img src={investigatorIcon} alt="Cluify Investigator" style={{ width: '32px', height: '32px', marginRight: '8px' }} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
            <IconButton aria-label="How to play" color="inherit" size="large" onClick={() => setHowToOpen(true)} sx={{ p: { xs: 0.5, sm: 1 } }}>
              <HelpOutlineIcon sx={{ fontSize: { xs: 24, sm: 32 } }} />
            </IconButton>
            {/* {user && (
              <IconButton aria-label="Stats" color="inherit" size="large">
                <BarChartIcon sx={{ fontSize: { xs: 24, sm: 32 } }} />
              </IconButton>
            )} */}
            <IconButton aria-label="Settings" color="inherit" size="large" onClick={onSettings} sx={{ p: { xs: 0.5, sm: 1 } }}>
              <SettingsIcon sx={{ fontSize: { xs: 24, sm: 32 } }} />
            </IconButton>
            <Button
                variant="outlined"
                onClick={onPractice}
                color="inherit"
                sx={{
                  borderRadius: '20px',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  py: { xs: 0.25, sm: 0.5 },
                  px: { xs: 1, sm: 2 },
                  ml: 1,
                  fontSize: { xs: '0.75rem', sm: '1rem' },
                }}
              >
                Practice
              </Button>
            {/* {user ? (
              <Typography sx={{ fontWeight: 600, fontSize: { xs: 14, sm: 18 }, ml: { xs: 1, sm: 2 } }}>
                {user.username}
              </Typography>
            ) : ( */}
              <Button
                variant="outlined"
                color="inherit"
                sx={{
                  borderRadius: '20px',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  py: { xs: 0.25, sm: 0.5 },
                  px: { xs: 1, sm: 2 },
                  ml: 1,
                  fontSize: { xs: '0.75rem', sm: '1rem' },
                }}
              >
                Login
              </Button>
            {/* )} */}
          </Box>
        </Toolbar>
      </AppBar>
      <HowToPlayModal open={howToOpen} onClose={() => setHowToOpen(false)} darkMode={darkMode} />
    </>
  );
};

export default Header;