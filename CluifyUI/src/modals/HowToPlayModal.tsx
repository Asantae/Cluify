import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';

const HowToPlayModal = ({ open, onClose, darkMode }: {
  open: boolean;
  onClose: () => void;
  darkMode: boolean;
}) => {
  const bgColor = darkMode ? '#333' : '#fff';
  const textColor = darkMode ? '#fff' : '#000';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, boxShadow: '0 2px 16px rgba(0,0,0,0.2)', border: 'none', outline: 'none', backgroundColor: bgColor, color: textColor, maxHeight: { xs: '70vh', sm: '70vh', md: '90vh' } } }}>
      <DialogTitle sx={{ fontWeight: 700, textAlign: 'center', p: 2, pb: 1, fontSize: 20 }}>
        How To Play
        <IconButton aria-label="close" onClick={onClose} size="small" sx={{ position: 'absolute', right: 12, top: 12, color: textColor }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 1, pb: 2 }}>
        <Typography sx={{ mb: 2 }}>
          Solve the daily case by analyzing reports, searching databases, and linking evidence to identify the culprit.
        </Typography>
        <ul style={{ margin: 0, paddingLeft: 20, marginBottom: 16 }}>
          <li>Review all available clues and reports to understand the case.</li>
          <li>Search through databases to find DMV records and link them to suspects.</li>
          <li>Access phone records, purchase history, and other evidence to build your case.</li>
          <li>Link up to 3 pieces of evidence to your report before submitting.</li>
          <li>Submit your accusation with linked evidence when you're confident.</li>
          <li>You have 5 attempts to solve the case correctly!</li>
          <li><strong>Warning:</strong> Hacking 3 different people will cost you an attempt! (Hacking both phone and receipts of the same person is free)</li>
        </ul>
        <Typography sx={{ fontWeight: 600, mt: 2, mb: 1 }}>Success Conditions</Typography>
        <ul style={{ margin: 0, paddingLeft: 20, marginBottom: 16 }}>
          <li><strong>Green:</strong> Correct suspect with sufficient evidence (≥50 points)</li>
          <li><strong>Yellow:</strong> Correct suspect but insufficient evidence</li>
          <li><strong>Red:</strong> Wrong suspect selected</li>
        </ul>
        <Typography sx={{ fontWeight: 600, mt: 2, mb: 1 }}>Tips</Typography>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>Evidence has different point values - choose wisely!</li>
          <li>You need at least 50 evidence points for a complete success.</li>
          <li>Both wrong suspects and insufficient evidence count as failed attempts.</li>
          <li>Each day brings a new case to solve!</li>
        </ul>
      </DialogContent>
    </Dialog>
  )
};

export default HowToPlayModal; 