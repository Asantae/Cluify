import { useState } from 'react';
import { IconButton, Typography, Box, Paper, Button, useTheme, useMediaQuery } from '@mui/material';
import Grid from '@mui/material/Grid';
import DraggablePaper from '../components/DraggablePaper';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Report } from '../types';
import paperTexture from '../assets/paper_texture.png';
import { submitReport, isLoggedIn } from '../services/api';
import Snackbar from '@mui/material/Snackbar';

interface EvidenceItem {
    Id: string;
    type: 'Social Media Post' | 'Search History' | 'Phone Record' | 'Purchase Record' | 'Police Record';
    content: string;
  source: any;
}

interface SuspiciousPersonReportModalProps {
  open: boolean;
  onClose: () => void;
  reports: Report[];
  darkMode: boolean;
  currentReportIndex: number;
  setCurrentReportIndex: React.Dispatch<React.SetStateAction<number>>;
  linkedDmvRecords: { [reportId: string]: any | null };
  setLinkedDmvRecords: React.Dispatch<React.SetStateAction<{ [reportId: string]: any | null }>>;
  onReportSubmitted?: () => void;
}

const SuspiciousPersonReportModal = ({ open, onClose, reports, darkMode, currentReportIndex, setCurrentReportIndex, linkedDmvRecords, setLinkedDmvRecords, onReportSubmitted }: SuspiciousPersonReportModalProps) => {
  const [linkedEvidence, setLinkedEvidence] = useState<EvidenceItem[]>([]);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [submitLoading, setSubmitLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

  const handleNext = () => {
    setCurrentReportIndex((prev) => (prev + 1) % reports.length);
  };

  const handlePrevious = () => {
    setCurrentReportIndex((prev) => (prev - 1 + reports.length) % reports.length);
  };

  const removeDmvRecord = () => {
    const reportId = reports[currentReportIndex]?.Id;
    if (reportId) {
      setLinkedDmvRecords(prev => ({ ...prev, [reportId]: null }));
    }
  };

  const removeEvidence = (id: string) => setLinkedEvidence(prev => prev.filter(item => item.Id !== id));

  const currentReport = reports[currentReportIndex];
  const currentSuspect = currentReport?.Suspect;
  const suspectName = [currentSuspect?.FirstName, currentSuspect?.LastName].filter(Boolean).join(' ') || '—';
    
  const handleId = "suspicious-person-report-handle";

  if (!open) return null;

  return (
    <Box>
      <DraggablePaper
        handleId={handleId}
        modalId="suspiciousPersonReport"
        PaperProps={isSmallScreen ? {
          sx: {
            backgroundImage: `url(${paperTexture})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: '#000',
            fontFamily: "'Courier New', Courier, monospace",
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            border: '1px solid #888',
            borderRadius: '4px',
            width: '90vw',
            maxWidth: '90vw',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '75vh',
            overflow: 'hidden',
          }
        } : {
          sx: {
            position: 'relative',
            overflow: 'hidden',
            color: '#000',
            fontFamily: "'Courier New', Courier, monospace",
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            border: '1px solid #888',
            borderRadius: '4px',
            width: { xs: '90vw', sm: 500 },
            maxWidth: 520,
            maxHeight: { xs: '75vh', sm: '90vh' },
            display: 'flex',
            flexDirection: 'column',
          }
        }}
      >
        <div>
          <Box
            sx={{
              backgroundImage: `url(${paperTexture})`,
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              position: 'absolute',
              top: 0,
              left: '-10%',
              width: '120%',
              height: '100%',
              zIndex: 0,
              pointerEvents: 'none',
            }}
          />
          <Box sx={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box 
              id={handleId}
              sx={{ cursor: 'move', textAlign: 'center', pt: 2, pb: 1 }}
            >
              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '1.05rem' }}>
                Anonymous Report
              </Typography>
              <IconButton
                aria-label="close"
                onClick={onClose}
                sx={{ position: 'absolute', right: 8, top: 8, color: '#000' }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            <Box sx={{ position: 'relative', overflowY: 'auto', p: { xs: 2, sm: 3 }, pt: 0, flexGrow: 1, maxHeight: { xs: '60vh', sm: '70vh' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, position: 'relative' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }} gutterBottom>
                  <span style={{ fontWeight: 600 }}>Suspect Name:</span> <span style={{ fontWeight: 400 }}>{suspectName}</span>
                </Typography>
                <Box sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={!linkedDmvRecords[reports[currentReportIndex]?.Id] || submitLoading}
                    onClick={async () => {
                      setSubmitLoading(true);
                      setSnackbar({ open: false, message: '' });
                      try {
                        const userId = isLoggedIn() ? localStorage.getItem('userId') || '' : '';
                        const currentReport = reports[currentReportIndex];
                        const result = await submitReport(
                          userId,
                          currentReport?.Id,
                          linkedDmvRecords[currentReport?.Id]?.Id,
                          currentReport?.CaseId,
                          [] // evidenceIds, empty for now
                        );
                        if (onReportSubmitted) onReportSubmitted();
                        if (result.success) {
                          setSnackbar({ open: true, message: 'Report submitted!' });
                        } else {
                          setSnackbar({ open: true, message: 'Incorrect Submission' });
                        }
                      } catch (err: any) {
                        setSnackbar({ open: true, message: 'Incorrect Submission' });
                      } finally {
                        setSubmitLoading(false);
                      }
                    }}
                    sx={{
                      borderRadius: 99,
                      px: 1.5,
                      py: 0.3,
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      boxShadow: 2,
                      textTransform: 'uppercase',
                      minWidth: 0,
                      ml: 2,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {submitLoading ? 'Submitting...' : 'Submit'}
                  </Button>
                </Box>
              </Box>
              <Grid >
                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.82rem' }} gutterBottom>
                  <strong>DATE:</strong> {currentReport?.ReportDate 
                    ? new Date(currentReport.ReportDate).toLocaleString('en-US', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit' }) 
                    : '—'}
                </Typography>
              </Grid>
              <Grid container columns={{ xs: 3, md: 4 }} spacing={{xs: 0, md: 1}} sx={{ mt: 1}}>
                <Grid size={{ xs: 1, md: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem' }}><strong>Alias:</strong> {currentSuspect?.Aliases?.join(', ') || '—'}</Typography>
                </Grid>
                <Grid size={{ xs: 1, md: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem' }}><strong>SEX:</strong> {currentSuspect?.Sex || '—'}</Typography>
                </Grid>
                <Grid size={{ xs: 1, md: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem' }}><strong>HEIGHT:</strong> {currentSuspect?.Height || '—'}</Typography>
                </Grid>
                <Grid size={{ xs: 1, md: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem' }}><strong>HAIR:</strong> {currentSuspect?.HairColor || '—'}</Typography>
                </Grid>
                <Grid size={{ xs: 1, md: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem' }}><strong>AGE:</strong> {currentSuspect?.Age || '—'}</Typography>
                </Grid>
                <Grid size={{ xs: 1, md: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem' }}><strong>WEIGHT:</strong> {currentSuspect?.Weight || '—'}</Typography>
                </Grid>
                <Grid size={{ xs: 1, md: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem' }}><strong>EYES:</strong> {currentSuspect?.EyeColor || '—'}</Typography>
                </Grid>
                <Grid size={{ xs: 1, md: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.70rem' }}><strong>LICENSE PLATE:</strong> {linkedDmvRecords[reports[currentReportIndex]?.Id]?.licensePlate || '—'}</Typography>
                </Grid>
              </Grid>
              <Box sx={{ mb: 1 , mt: .5}}>
                <Typography variant="subtitle2" sx={{ mb: 1, textTransform: 'uppercase', fontWeight: 'bold', fontSize: '0.95rem' }}>Report:</Typography>
                {currentReport?.Details && currentReport.Details.length > 220 ? (
                  <Box sx={{ maxHeight: { xs: 90, sm: 'none' }, overflowY: { xs: 'auto', sm: 'visible' }, borderRadius: 1, background: 'transparent', p: { xs: 0.5, sm: 0 } }}>
                    <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{currentReport.Details}</Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{currentReport?.Details}</Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 0.2, sm: 0.5 }, mt: 3 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: { xs: 1, sm: 2 },
                    backgroundColor: 'transparent',
                    border: linkedDmvRecords[reports[currentReportIndex]?.Id]
                      ? theme => `2px solid ${theme.palette.success.main}`
                      : theme => `1px dashed ${theme.palette.error.main}`,
                    transition: 'border 0.2s',
                    mb: { xs: 0.5, sm: 1 },
                  }}
                >
                  <Typography variant="h4" sx={{ color: '#000', mb: { xs: 0.7, sm: 1 }, fontWeight: 600, fontSize: { xs: '0.98rem', sm: '1.05rem' } }}>DMV Record</Typography>
                  {linkedDmvRecords[reports[currentReportIndex]?.Id] ? (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ color: '#000', fontWeight: 500, fontSize: { xs: '0.85rem', sm: '0.92rem' } }}>
                        {linkedDmvRecords[reports[currentReportIndex]?.Id].firstName} {linkedDmvRecords[reports[currentReportIndex]?.Id].lastName}
                      </Typography>
                      <IconButton size="small" sx={{ color: '#000' }} onClick={removeDmvRecord} aria-label="Remove DMV Record">
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ color: '#555', fontSize: { xs: '0.8rem', sm: '0.92rem' }, fontWeight: 400 }}>No record linked.</Typography>
                  )}
                </Paper>
                <Paper
                  variant="outlined"
                  sx={{
                    p: { xs: 1, sm: 2 },
                    backgroundColor: 'transparent',
                    border: linkedEvidence.length > 0
                      ? theme => `2px solid ${theme.palette.success.main}`
                      : theme => `1px dashed ${theme.palette.error.main}`,
                    transition: 'border 0.2s',
                    mb: { xs: 0.5, sm: 1 },
                  }}
                >
                  <Typography variant="subtitle2" sx={{ color: '#000', mb: { xs: 0.7, sm: 1 }, fontWeight: 600, fontSize: { xs: '0.98rem', sm: '0.95rem' }, textTransform: 'uppercase' }}>Evidence</Typography>
                  {linkedEvidence.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {linkedEvidence.map(item => (
                        <Box key={item.Id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography sx={{ color: '#000', fontSize: { xs: '0.78rem', sm: '0.82rem' }, fontWeight: 500 }}>
                            <span style={{ fontWeight: 600 }}>{item.type}:</span> {item.content.substring(0, 30)}...
                          </Typography>
                          <IconButton size="small" sx={{ color: '#000' }} onClick={() => removeEvidence(item.Id)} aria-label="Remove Evidence">
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ color: '#555', fontSize: { xs: '0.8rem', sm: '0.92rem' }, fontWeight: 400 }}>No evidence linked.</Typography>
                  )}
                </Paper>
              </Box>
            </Box>
            <Box sx={{ px: 3, py: 1, backgroundColor: 'transparent', borderTop: '1px solid rgba(0,0,0,0.12)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button onClick={handlePrevious} disabled={reports.length <= 1} sx={{ color: '#000' }}> <ArrowBackIcon /> <Typography sx={{ ml: 1 }}>Previous</Typography> </Button>
                <Typography sx={{ fontSize: '0.7rem' }}>{currentReportIndex + 1} / {reports.length}</Typography>
                <Button onClick={handleNext} disabled={reports.length <= 1} sx={{ color: '#000' }}> <Typography sx={{ mr: 1 }}>Next</Typography> <ArrowForwardIcon /> </Button>
              </Box>
            </Box>
          </Box>
        </div>
      </DraggablePaper>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={(_, reason) => {
          if (reason !== 'clickaway') {
            setSnackbar({ open: false, message: '' });
          }
        }}
        message={
          <span style={{
            fontWeight: 600,
            fontSize: isSmallScreen ? '1rem' : '0.95rem',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            letterSpacing: 0.5,
            minHeight: 28
          }}>{snackbar.message}</span>
        }
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        ContentProps={{
          sx: {
            backgroundColor: darkMode ? '#333' : '#fff',
            color: darkMode ? '#fff' : '#000',
            fontWeight: 600,
            borderRadius: 2,
            boxShadow: 3,
            px: 1.5,
            py: 0.8,
            minWidth: 0,
            maxWidth: isSmallScreen ? '65vw' : 260,
            width: 'auto',
            left: '50%',
            transform: 'translateX(-50%)',
            mb: isSmallScreen ? 2.5 : 3.5,
            textAlign: 'center',
          }
        }}
      />
    </Box>
  );
};

export default SuspiciousPersonReportModal; 
