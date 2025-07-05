import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/material';

const ContentWarningModal = ({ open, onContinue, darkMode }: {
  open: boolean;
  onContinue: () => void;
  darkMode: boolean;
}) => (
  <Dialog open={open} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, background: darkMode ? '#222' : '#fff', color: darkMode ? '#fff' : '#222', boxShadow: '0 2px 16px rgba(0,0,0,0.2)', border: 'none', outline: 'none' } }}>
    <DialogTitle sx={{ fontWeight: 700, textAlign: 'center', p: 2, pb: 1, fontSize: 20 }}>
      Content Warning
    </DialogTitle>
    <DialogContent sx={{ pt: 1, pb: 2 }}>
      <Typography sx={{ mb: 2, textAlign: 'center' }}>
        Please be advised that the cases in this game may contain themes and content that some players might find triggering or sensitive. Player discretion is advised.
      </Typography>
    </DialogContent>
    <DialogActions sx={{ justifyContent: 'center', p: 2, pt: 0 }}>
      <Button onClick={onContinue} variant="contained" color="primary" sx={{ fontWeight: 600, px: 4 }}>
        Acknowledge & Continue
      </Button>
    </DialogActions>
  </Dialog>
);

export default ContentWarningModal; 