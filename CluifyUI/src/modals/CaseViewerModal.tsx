import { DialogContent, DialogTitle, IconButton, Typography, Box } from '@mui/material';
import DraggablePaper from '../components/DraggablePaper';
import CloseIcon from '@mui/icons-material/Close';
import { Case } from '../types';
import { keyframes } from '@mui/system';

// Define the flashing animation
const flash = keyframes`
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
`;

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
          sx={{ 
            borderBottom: '1px solid rgba(0, 0, 0, 0.2)',
            py: 1,
            px: 1.5
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography component="span">Case #{caseData.CaseNumber}</Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: darkMode ? '#ccc' : '#666',
                animation: `${flash} 1.5s ease-in-out infinite`,
                fontStyle: 'italic',
                fontSize: '0.8rem',
                mr: 3,
              }}
            >
              drag to move
            </Typography>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
                color: titleTextColor,
                p: 0,
                minWidth: 'auto'
            }}
          >
            <CloseIcon />
          </IconButton>
          </Box>
          <Typography 
            variant="body2" 
            sx={{ 
              color: titleTextColor,
              fontSize: '0.8rem',
              textAlign: 'right'
            }}
          >
            {!caseData.IsActive && `Difficulty: ${caseData.Difficulty}`}
          </Typography>
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
          <Box sx={{ pt: 2 }}>
            {!caseData.IsActive && caseData.Title && (
              <Typography gutterBottom><strong>Title:</strong> {caseData.Title}</Typography>
            )}
            <Typography gutterBottom><strong>Victim(s):</strong> {caseData.VictimName?.join(', ') || '—'}</Typography>
            <Typography gutterBottom><strong>Date of Incident:</strong> {caseData.DateOfIncident ? new Date(caseData.DateOfIncident).toLocaleDateString() : '—'}</Typography>
            <Typography gutterBottom><strong>Location:</strong> {caseData.Location || '—'}</Typography>
            <Typography sx={{ mt: 2 }} gutterBottom><strong>Details:</strong></Typography>
            <Typography gutterBottom variant="body2">{caseData.Details}</Typography>
            {caseData.Objective && caseData.Objective.trim() !== '' && (
              <>
            <Typography sx={{ mt: 2 }} gutterBottom><strong>Objective:</strong></Typography>
            <Typography gutterBottom variant="body2">{caseData.Objective}</Typography>
              </>
            )}
          </Box>
        </DialogContent>
      </div>
    </DraggablePaper>
  );
};

export default CaseViewerModal;
