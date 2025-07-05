import { Box, Typography, Button } from '@mui/material';

const PlayScreen = ({ onPlay, darkMode }: { onPlay: () => void; darkMode: boolean }) => (
  <Box sx={{
    minHeight: '100vh',
    width: '100vw',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'fixed',
    top: 0,
    left: 0,
    p: 3,
    boxSizing: 'border-box',
    touchAction: 'manipulation'
  }}>
    <Typography variant="h1" sx={{ fontSize: 64, mb: 2 }} role="img" aria-label="game icon">
      🕵️‍♂️
    </Typography>
    <Typography variant="h2" sx={{ fontWeight: 700, fontSize: 36, mb: 0, letterSpacing: 1, textAlign: 'center' }}>
      Cluify
    </Typography>
    <Typography sx={{ fontSize: 18, mt: 2, mb: 4, textAlign: 'center', maxWidth: 320 }}>
      Investigate clues and solve the daily case. Every choice matters.
    </Typography>
    <Button
      variant="outlined"
      size="large"
      onClick={onPlay}
      sx={{
        fontSize: 20,
        px: 5,
        py: 1.5,
        borderRadius: 50,
        fontWeight: 600,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        letterSpacing: 1,
        outline: 'none',
        color: darkMode ? '#fff' : '#222',
        borderColor: darkMode ? '#fff' : '#222',
        '&:hover': {
          backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)',
          borderColor: darkMode ? '#fff' : '#222',
        },
      }}
    >
      Play
    </Button>
  </Box>
);

export default PlayScreen; 