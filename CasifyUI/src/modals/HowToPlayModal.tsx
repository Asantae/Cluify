import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';

const HowToPlayModal = ({ open, onClose, darkMode }: {
  open: boolean;
  onClose: () => void;
  darkMode: boolean;
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, background: darkMode ? '#222' : '#fff', color: darkMode ? '#fff' : '#222', boxShadow: '0 2px 16px rgba(0,0,0,0.2)', border: 'none', outline: 'none' } }}>
    <DialogTitle sx={{ fontWeight: 700, textAlign: 'center', p: 2, pb: 1, fontSize: 20 }}>
      How To Play
      <IconButton aria-label="close" onClick={onClose} size="small" sx={{ position: 'absolute', right: 12, top: 12, color: darkMode ? '#fff' : '#222' }}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </DialogTitle>
    <DialogContent sx={{ pt: 1, pb: 2 }}>
      <Typography sx={{ mb: 2 }}>
        Solve the daily case by analyzing reports, searching databases, and submitting evidence to identify the culprit.
      </Typography>
      <ul style={{ margin: 0, paddingLeft: 20, marginBottom: 16 }}>
        <li>Review the suspicious person report for clues.</li>
        <li>Search police, DMV, and social media databases to gather evidence.</li>
        <li>Cross-reference findings to narrow down suspects.</li>
        <li>Submit your accusation with supporting evidence to solve the case.</li>
      </ul>
      <Typography sx={{ fontWeight: 600, mt: 2, mb: 1 }}>Tips</Typography>
      <ul style={{ margin: 0, paddingLeft: 20 }}>
        <li>Use all available clues—some details may be ambiguous.</li>
        <li>Incorrect or weak evidence will lower your score.</li>
        <li>Each day brings a new case to solve!</li>
      </ul>
    </DialogContent>
  </Dialog>
);

export default HowToPlayModal; 