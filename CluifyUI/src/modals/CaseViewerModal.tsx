import { DialogContent, DialogTitle, IconButton, Typography, Box } from '@mui/material';
import DraggablePaper from '../components/DraggablePaper';
import CloseIcon from '@mui/icons-material/Close';
import { Case } from '../types';

interface CaseViewerModalProps {
  open: boolean;
  onClose: () => void;
  caseData: Case | null;
  darkMode: boolean;
}

const CaseViewerModal = ({ open, onClose, caseData, darkMode }: CaseViewerModalProps) => {
  if (!open || !caseData) return null;

  const titleBgColor = darkMode ? '#424242' : '#e0e0e0';
  const contentBgColor = darkMode ? '#333' : '#f5f5f5';
  const titleTextColor = darkMode ? '#fff' : '#000';
  const contentTextColor = darkMode ? '#fff' : '#000';
  const handleId = "case-viewer-handle";

  return (
    <DraggablePaper handleId={handleId} modalId="caseViewer">
      <div>
        <DialogTitle
          style={{ cursor: 'move', backgroundColor: titleBgColor, color: titleTextColor }}
          id={handleId}
          sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.2)' }}
        >
          <Typography component="span">Case #{caseData.CaseNumber}</Typography>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: titleTextColor
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{
          backgroundColor: contentBgColor,
          color: contentTextColor,
          border: '1px solid rgba(0, 0, 0, 0.2)',
          borderTop: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          width: { xs: '90vw', md: 650 },
          maxWidth: '90vw',
          maxHeight: '60vh',
          overflowY: 'auto',
        }}>
          <Typography variant="body2" sx={{ position: 'absolute', top: 38, right: 16, color: contentTextColor }}>
            Difficulty: {caseData.Difficulty}
          </Typography>
          <Box sx={{ pt: 2 }}>
            {caseData.CanBePractice && caseData.Title && (
              <Typography gutterBottom><strong>Title:</strong> {caseData.Title}</Typography>
            )}
            <Typography gutterBottom><strong>Victim(s):</strong> {caseData.VictimName?.join(', ') || '—'}</Typography>
            <Typography gutterBottom><strong>Date of Incident:</strong> {caseData.DateOfIncident ? new Date(caseData.DateOfIncident).toLocaleDateString() : '—'}</Typography>
            <Typography gutterBottom><strong>Location:</strong> {caseData.Location || '—'}</Typography>
            <Typography sx={{ mt: 2 }} gutterBottom><strong>Details:</strong></Typography>
            <Typography gutterBottom variant="body2">{caseData.Details}</Typography>
            <Typography sx={{ mt: 2 }} gutterBottom><strong>Objective:</strong></Typography>
            <Typography gutterBottom variant="body2">{caseData.Objective}</Typography>
          </Box>
        </DialogContent>
      </div>
    </DraggablePaper>
  );
};

export default CaseViewerModal;
