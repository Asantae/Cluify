import { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import SettingsIcon from '@mui/icons-material/Settings';
import { Box } from '@mui/material';
import HowToPlayModal from '../modals/HowToPlayModal';
import investigatorIcon from '../assets/cluify_investigator_icon.png';
import LoginModal from '../modals/LoginModal';

import { isLoggedIn, getFeatureFlags } from '../services/api';
import { FeatureFlags } from '../types';

const Header = ({ onSettings, onPractice, darkMode }: { onSettings: () => void; onPractice: () => void; darkMode: boolean; }) => {
  const [howToOpen, setHowToOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>({ ShowLoginButton: false });

  useEffect(() => {
    const fetchFeatureFlags = async () => {
      try {
        const flags = await getFeatureFlags();
        setFeatureFlags(flags);
      } catch (error) {
        console.error('Failed to fetch feature flags:', error);
        // Default to false if fetch fails
        setFeatureFlags({ ShowLoginButton: false });
      }
    };

    fetchFeatureFlags();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setLoggedIn(false);
    window.location.reload(); // Optionally force refresh to update UI everywhere
  };

  return (
    <>
      <AppBar position="static" color="transparent" elevation={0} sx={{ border: 0, boxShadow: 'none', borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar sx={{ minHeight: 56, px: { xs: 1, sm: 2 }, display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img src={investigatorIcon} alt="Cluify Investigator" style={{ width: '32px', height: '32px', marginLeft: '8px', marginRight: '8px' }} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.25, sm: 0.5 } }}>
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
            {loggedIn ? (
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleLogout}
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
                Logout
              </Button>
            ) : featureFlags.ShowLoginButton ? (
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => setLoginOpen(true)}
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
            ) : null}
          </Box>
        </Toolbar>
      </AppBar>
      <HowToPlayModal open={howToOpen} onClose={() => setHowToOpen(false)} darkMode={darkMode} />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} darkMode={darkMode} />
    </>
  );
};

export default Header;