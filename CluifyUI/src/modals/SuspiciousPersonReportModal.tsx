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



interface SuspiciousPersonReportModalProps {
  open: boolean;
  onClose: () => void;
  reports: Report[];
  darkMode: boolean;
  currentReportIndex: number;
  setCurrentReportIndex: React.Dispatch<React.SetStateAction<number>>;
  linkedDmvRecords: { [reportId: string]: any | null };
  setLinkedDmvRecords: React.Dispatch<React.SetStateAction<{ [reportId: string]: any | null }>>;
  linkedEvidence: { [reportId: string]: Array<{ id: string; type: string; content: string }> };
  setLinkedEvidence: React.Dispatch<React.SetStateAction<{ [reportId: string]: Array<{ id: string; type: string; content: string }> }>>;
  setAttemptResults: React.Dispatch<React.SetStateAction<{ [caseId: string]: ('correct' | 'incorrect' | 'insufficient')[] }>>;
  onReportSubmitted?: () => void;
  onSuccessfulSubmission?: () => void;
  onFailedSubmission?: () => void;
}

const SuspiciousPersonReportModal = ({ open, onClose, reports, darkMode, currentReportIndex, setCurrentReportIndex, linkedDmvRecords, setLinkedDmvRecords, linkedEvidence, setLinkedEvidence, setAttemptResults, onReportSubmitted, onSuccessfulSubmission, onFailedSubmission }: SuspiciousPersonReportModalProps) => {
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
      // Also remove all linked evidence when DMV record is removed
      setLinkedEvidence(prev => ({ ...prev, [reportId]: [] }));
    }
  };

  const removeEvidence = (evidenceId: string) => {
    const currentReportId = reports[currentReportIndex]?.Id;
    if (currentReportId) {
      setLinkedEvidence(prev => ({
        ...prev,
        [currentReportId]: (prev[currentReportId] || []).filter(evidence => evidence.id !== evidenceId)
      }));
    }
  };

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
                    disabled={(() => {
                      const currentReportId = reports[currentReportIndex]?.Id;
                      const hasDmvRecord = linkedDmvRecords[currentReportId];
                      const currentEvidence = currentReportId ? linkedEvidence[currentReportId] || [] : [];
                      const hasEvidence = currentEvidence.length > 0;
                      return !hasDmvRecord || !hasEvidence || submitLoading;
                    })()}
                    onClick={async () => {
                      setSubmitLoading(true);
                      setSnackbar({ open: false, message: '' });
                      try {
                        const userId = isLoggedIn() ? localStorage.getItem('userId') || '' : '';
                        const currentReport = reports[currentReportIndex];
                        const currentReportId = currentReport?.Id;
                        const currentEvidence = currentReportId ? linkedEvidence[currentReportId] || [] : [];
                                        const evidenceIds = currentEvidence.map(evidence => evidence.id);
                                const result = await submitReport(
                  userId,
                  currentReport?.Id,
                  linkedDmvRecords[currentReport?.Id]?.id,
                  currentReport?.CaseId,
                  evidenceIds
                );
                        
                        // New success logic with 4 conditions:
                        // 1. Report ID matches suspicious person report
                        // 2. Suspect on report is guilty
                        // 3. Evidence has cumulative value over 50
                        // 4. Evidence IDs are returned (correct evidence)
                        
                        // Check if suspect is correct but evidence is insufficient/incorrect
                        const isCorrectSuspect = result.isCorrectSuspect === true;
                        const hasSufficientEvidence = result.evidenceValue >= 50;
                        const hasCorrectEvidence = result.evidenceIds && result.evidenceIds.length > 0;
                        
                        // Determine submission type
                        let submissionType = 'incorrect'; // red
                        if (isCorrectSuspect && hasSufficientEvidence && hasCorrectEvidence) {
                          submissionType = 'correct'; // green
                        } else if (isCorrectSuspect && (!hasSufficientEvidence || !hasCorrectEvidence)) {
                          submissionType = 'insufficient'; // yellow
                        }
                        if (submissionType === 'correct') {
                          setSnackbar({ open: true, message: 'Report submitted!' });
                          setTimeout(() => {
                            const currentReport = reports[currentReportIndex];
                            const caseId = currentReport?.CaseId || '';
                            setAttemptResults(prev => ({
                              ...prev,
                              [caseId]: [...(prev[caseId] || []), 'correct']
                            }));
                            if (onSuccessfulSubmission) onSuccessfulSubmission();
                          }, 0);
                          // Defer the callback to avoid React state update during render
                          setTimeout(() => {
                            if (onReportSubmitted) onReportSubmitted();
                          }, 0);
                        } else if (submissionType === 'insufficient') {
                          setSnackbar({ open: true, message: 'Correct suspect but insufficient evidence' });
                          setTimeout(() => {
                            const currentReport = reports[currentReportIndex];
                            const caseId = currentReport?.CaseId || '';
                            setAttemptResults(prev => ({
                              ...prev,
                              [caseId]: [...(prev[caseId] || []), 'insufficient']
                            }));
                            if (onFailedSubmission) onFailedSubmission();
                          }, 0);
                        } else {
                          setSnackbar({ open: true, message: 'Incorrect Submission' });
                          setTimeout(() => {
                            const currentReport = reports[currentReportIndex];
                            const caseId = currentReport?.CaseId || '';
                            setAttemptResults(prev => ({
                              ...prev,
                              [caseId]: [...(prev[caseId] || []), 'incorrect']
                            }));
                            if (onFailedSubmission) onFailedSubmission();
                          }, 0);
                        }
                      } catch (err: any) {
                        setSnackbar({ open: true, message: 'Incorrect Submission' });
                        if (onFailedSubmission) onFailedSubmission();
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
                <Box sx={{ 
                  maxHeight: { xs: 60, sm: 80 }, 
                  overflowY: 'auto', 
                  borderRadius: 1, 
                  background: 'transparent', 
                  p: { xs: 0.5, sm: 0 },
                  '&::-webkit-scrollbar': {
                    width: '8px'
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    borderRadius: '4px'
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    borderRadius: '4px',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.5)'
                    }
                  }
                }}>
                  <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{currentReport?.Details}</Typography>
                </Box>
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
                    border: (() => {
                      const currentReportId = reports[currentReportIndex]?.Id;
                      const currentEvidence = currentReportId ? linkedEvidence[currentReportId] || [] : [];
                      return currentEvidence.length > 0
                        ? theme => `2px solid ${theme.palette.success.main}`
                        : theme => `1px dashed ${theme.palette.error.main}`;
                    })(),
                    transition: 'border 0.2s',
                    mb: { xs: 0.5, sm: 1 },
                    maxHeight: '100px',
                    overflow: 'hidden',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 0.7, sm: 1 } }}>
                    <Typography variant="subtitle2" sx={{ color: '#000', fontWeight: 600, fontSize: { xs: '0.98rem', sm: '0.95rem' }, textTransform: 'uppercase' }}>Evidence</Typography>
                    {(() => {
                      const currentReportId = reports[currentReportIndex]?.Id;
                      const currentEvidence = currentReportId ? linkedEvidence[currentReportId] || [] : [];
                      return currentEvidence.length > 0 ? (
                        <Typography variant="body2" sx={{ color: '#555', fontSize: { xs: '0.75rem', sm: '0.8rem' }, fontWeight: 500 }}>
                          Selected: {currentEvidence.length}/3
                        </Typography>
                      ) : null;
                    })()}
                  </Box>
                  <Box sx={{ maxHeight: '60px', overflowY: 'auto', '&::-webkit-scrollbar': { width: '8px' }, '&::-webkit-scrollbar-track': { background: '#f1f1f1' }, '&::-webkit-scrollbar-thumb': { background: '#888', borderRadius: '4px' }, '&::-webkit-scrollbar-thumb:hover': { background: '#555' } }}>
                    {(() => {
                      const currentReportId = reports[currentReportIndex]?.Id;
                      const currentEvidence = currentReportId ? linkedEvidence[currentReportId] || [] : [];
                      return currentEvidence.length > 0 ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {currentEvidence.map(item => (
                            <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography sx={{ color: '#000', fontSize: { xs: '0.78rem', sm: '0.82rem' }, fontWeight: 500 }}>
                                <span style={{ fontWeight: 600 }}>{item.type}:</span> {item.content.substring(0, 30)}...
                              </Typography>
                              <IconButton size="small" sx={{ color: '#000' }} onClick={() => removeEvidence(item.id)} aria-label="Remove Evidence">
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="body2" sx={{ color: '#555', fontSize: { xs: '0.8rem', sm: '0.92rem' }, fontWeight: 400 }}>No evidence linked.</Typography>
                      );
                    })()}
                  </Box>
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
