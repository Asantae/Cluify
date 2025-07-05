import { Box, Typography } from '@mui/material';

interface DesktopIconProps {
  icon: string;
  label: string;
  onClick: () => void;
  darkMode: boolean;
}

const DesktopIcon = ({ icon, label, onClick, darkMode }: DesktopIconProps) => (
  <Box
    onClick={onClick}
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 1,
      p: { xs: 1, sm: 2 },
      cursor: 'pointer',
      userSelect: 'none',
      width: { xs: 80, sm: 120 },
      textAlign: 'center',
      '&:hover': {
        backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)',
        borderRadius: 2,
      },
    }}
  >
    <img src={icon} alt={`${label} icon`} style={{ width: 'clamp(48px, 10vw, 64px)', height: 'clamp(48px, 10vw, 64px)' }} />
    <Typography sx={{ 
      color: darkMode ? '#fff' : '#000', 
      textShadow: darkMode ? '1px 1px 2px #000' : 'none',
      fontSize: { xs: '0.75rem', sm: '1rem' }
    }}>
      {label}
    </Typography>
  </Box>
);

export default DesktopIcon; 