import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';

const HowToPlayModal = ({ open, onClose }: {
  open: boolean;
  onClose: () => void;
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, boxShadow: '0 2px 16px rgba(0,0,0,0.2)', border: 'none', outline: 'none' } }}>
    <DialogTitle sx={{ fontWeight: 700, textAlign: 'center', p: 2, pb: 1, fontSize: 20 }}>
      How To Play
      <IconButton aria-label="close" onClick={onClose} size="small" sx={{ position: 'absolute', right: 12, top: 12, color: 'text.primary' }}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </DialogTitle>
    <DialogContent sx={{ pt: 1, pb: 2 }}>
      <Typography sx={{ mb: 2 }}>
        Solve the daily case by analyzing reports, searching databases, and submitting evidence to identify the culprit.
      </Typography>
      <ul style={{ margin: 0, paddingLeft: 20, marginBottom: 16 }}>
        <li>Review all available clues and reports to understand the case.</li>
        <li>Search through evidence records to connect clues to potential suspects.</li>
        <li>When you've identified the guilty party, submit an accusation with your strongest evidence.</li>
        <li>You must use between one and four pieces of evidence for each accusation.</li>
        <li>Be careful—you only have three attempts to correctly identify the suspect!</li>
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