import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';

const SettingsModal = ({ open, onClose, darkMode, setDarkMode }: {
  open: boolean;
  onClose: () => void;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, background: darkMode ? '#222' : '#fff', color: darkMode ? '#fff' : '#222', boxShadow: '0 2px 16px rgba(0,0,0,0.2)', border: 'none', outline: 'none' } }}>
    <DialogTitle sx={{ fontWeight: 700, textAlign: 'center', p: 2, pb: 1, fontSize: 20 }}>
      SETTINGS
      <IconButton aria-label="close" onClick={onClose} size="small" sx={{ position: 'absolute', right: 12, top: 12, color: darkMode ? '#fff' : '#222' }}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </DialogTitle>
    <DialogContent sx={{ pt: 1, pb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography sx={{ fontWeight: 500 }}>Dark Theme</Typography>
        <Switch
          checked={darkMode}
          onChange={e => setDarkMode(e.target.checked)}
          color={darkMode ? 'primary' : 'secondary'}
          sx={{
            '& .MuiSwitch-thumb': {
              backgroundColor: darkMode ? '#1976d2' : '#222',
            },
            '& .MuiSwitch-track': {
              backgroundColor: darkMode ? '#555' : '#bbb',
            },
          }}
        />
      </Box>
    </DialogContent>
    <Box sx={{ textAlign: 'center', fontSize: 12, color: darkMode ? '#888' : '#888', py: 1 }}>
      © {new Date().getFullYear()} Cluify
    </Box>
  </Dialog>
);

export default SettingsModal;