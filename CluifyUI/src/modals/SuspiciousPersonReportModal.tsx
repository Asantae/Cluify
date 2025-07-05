import { useState } from 'react';
import { DialogContent, DialogTitle, IconButton, Typography, Box, Paper, Button, useTheme, useMediaQuery } from '@mui/material';
import DraggablePaper from '../components/DraggablePaper';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Report } from '../types';

interface EvidenceItem {
    id: string;
    type: 'Social Media Post' | 'Search History' | 'Phone Record' | 'Purchase Record' | 'Police Record';
    content: string;
    source: any; // The original evidence object
}

interface SuspiciousPersonReportModalProps {
  open: boolean;
  onClose: () => void;
  reports: Report[];
  darkMode: boolean;
}

const SuspiciousPersonReportModal = ({ open, onClose, reports, darkMode }: SuspiciousPersonReportModalProps) => {
  const [currentReportIndex, setCurrentReportIndex] = useState(0);
  const [linkedDmvRecord, setLinkedDmvRecord] = useState<any | null>(null);
  const [linkedEvidence, setLinkedEvidence] = useState<EvidenceItem[]>([]);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handleNext = () => {
    setCurrentReportIndex((prev) => (prev + 1) % reports.length);
  };

  const handlePrevious = () => {
    setCurrentReportIndex((prev) => (prev - 1 + reports.length) % reports.length);
  };

  const removeDmvRecord = () => setLinkedDmvRecord(null);
  const removeEvidence = (id: string) => setLinkedEvidence(prev => prev.filter(item => item.id !== id));

  const currentReport = reports[currentReportIndex];
  const currentSuspect = currentReport?.suspect;
  const suspectName = [currentSuspect?.firstName, currentSuspect?.lastName].filter(Boolean).join(' ') || '—';
    
  const titleBgColor = darkMode ? '#424242' : '#f5f5f5';
  const contentBgColor = darkMode ? '#333' : '#fafafa';
  const paperBgColor = darkMode ? '#555' : '#fff';
  const dropzoneBgColor = darkMode ? '#666' : '#f0f0f0';
  const textColor = darkMode ? '#fff' : '#000';
  const handleId = "suspicious-person-report-handle";

  if (!open) return null;

  return (
    <DraggablePaper handleId="suspicious-person-report-handle" centerOnMount modalId="suspiciousPersonReport">
      <DialogTitle style={{ cursor: 'move', backgroundColor: titleBgColor, color: textColor }} id={handleId}>
        <Typography>Anonymous Report</Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8, color: textColor, zIndex: 1 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ 
        backgroundColor: contentBgColor, 
        color: textColor, 
        width: { xs: '90vw', sm: 500 },
        maxWidth: '90vw',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}>
        <Paper elevation={3} sx={{ p: 2, backgroundColor: paperBgColor, color: textColor, border: '1px solid #ccc' }}>
            <Box sx={{ mb: 2 }}>
                <Typography gutterBottom><strong>Suspect Name:</strong> {suspectName}</Typography>
                <Typography gutterBottom>
                    <strong>DATE:</strong> {currentReport?.reportDate 
                        ? new Date(currentReport.reportDate).toLocaleString('en-US', { 
                            month: 'numeric', 
                            day: 'numeric', 
                            hour: 'numeric', 
                            minute: '2-digit' 
                          }) 
                        : '—'}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '0 16px' }}>
                    <Typography><strong>Alias:</strong> {currentSuspect?.aliases?.join(', ') || '—'}</Typography>
                    <Typography><strong>SEX:</strong> {currentSuspect?.sex || '—'}</Typography>
                    <Typography><strong>HEIGHT:</strong> {currentSuspect?.height || '—'}</Typography>
                    <Typography><strong>HAIR:</strong> —</Typography>
                    <Typography><strong>AGE:</strong> {currentSuspect?.age || '—'}</Typography>
                    <Typography><strong>WEIGHT:</strong> {currentSuspect?.weight || '—'}</Typography>
                    <Typography><strong>EYES:</strong> —</Typography>
                </Box>
            </Box>
            <Typography sx={{ mb: 2 }}><strong>REPORT:</strong></Typography>
            <Box sx={{ maxHeight: 150, overflowY: 'auto', border: '1px solid #eee', p: 1, mb: 2, backgroundColor: darkMode ? '#444' : '#fafafa' }}>
                <Typography variant="body2">{currentReport?.details}</Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* DMV Record Section */}
              <Paper variant="outlined" sx={{ p: 2, backgroundColor: dropzoneBgColor }}>
                <Typography variant="h6" sx={{ color: textColor, mb: 1 }}>DMV Record</Typography>
                {linkedDmvRecord ? (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ color: textColor }}>
                        {/* Replace with actual data */}
                        John Doe (Age: 35, DOB: 1989-01-15)
                      </Typography>
                      <Button size="small" variant="outlined" color="secondary" onClick={removeDmvRecord}>Remove</Button>
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ color: textColor }}>1/1: No record linked.</Typography>
                )}
              </Paper>
              {/* Evidence Section */}
              <Paper variant="outlined" sx={{ p: 2, backgroundColor: dropzoneBgColor }}>
                  <Typography variant="h6" sx={{ color: textColor, mb: 1 }}>Evidence ({linkedEvidence.length}/4)</Typography>
                  {linkedEvidence.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {linkedEvidence.map(item => (
                        <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography sx={{ color: textColor }}>
                            <strong>{item.type}:</strong> {item.content.substring(0, 30)}...
                          </Typography>
                          <Button size="small" variant="outlined" color="secondary" onClick={() => removeEvidence(item.id)}>Remove</Button>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                  <Typography variant="body2" sx={{ color: textColor }}>No evidence linked.</Typography>
                  )}
              </Paper>
            </Box>
        </Paper>
      </DialogContent>
      <Box sx={{ p: 2, backgroundColor: titleBgColor, borderTop: `1px solid ${darkMode ? '#444' : '#ddd'}` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button onClick={handlePrevious} disabled={reports.length <= 1} sx={{ color: textColor }}>
              <ArrowBackIcon />
              {!isSmallScreen && <Typography sx={{ ml: 1 }}>Previous Report</Typography>}
            </Button>
            <Typography sx={{ fontSize: isSmallScreen ? '0.8rem' : '1rem' }}>
              {currentReportIndex + 1} / {reports.length}
            </Typography>
            <Button onClick={handleNext} disabled={reports.length <= 1} sx={{ color: textColor }}>
              {!isSmallScreen && <Typography sx={{ mr: 1 }}>Next Report</Typography>}
              <ArrowForwardIcon />
            </Button>
          </Box>
      </Box>
    </DraggablePaper>
  );
};

export default SuspiciousPersonReportModal; 