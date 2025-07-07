import { useState } from 'react';
import { IconButton, Typography, Box, Paper, Button, useTheme, useMediaQuery } from '@mui/material';
import Grid from '@mui/material/Grid';
import DraggablePaper from '../components/DraggablePaper';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Report } from '../types';
import paperTexture from '../assets/paper_texture.png';
import DmvSearchModal from './DmvSearchModal';
import { submitReport } from '../services/api';

interface EvidenceItem {
    id: string;
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
}

const SuspiciousPersonReportModal = ({ open, onClose, reports, darkMode, currentReportIndex, setCurrentReportIndex, linkedDmvRecords, setLinkedDmvRecords }: SuspiciousPersonReportModalProps) => {
  const [linkedEvidence, setLinkedEvidence] = useState<EvidenceItem[]>([]);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleNext = () => {
    setCurrentReportIndex((prev) => (prev + 1) % reports.length);
  };

  const handlePrevious = () => {
    setCurrentReportIndex((prev) => (prev - 1 + reports.length) % reports.length);
  };

  const handleSelectDmvRecord = (record: any) => {
    const reportId = reports[currentReportIndex]?.id;
    if (reportId) {
      setLinkedDmvRecords(prev => ({ ...prev, [reportId]: record }));
    }
  };

  const removeDmvRecord = () => {
    const reportId = reports[currentReportIndex]?.id;
    if (reportId) {
      setLinkedDmvRecords(prev => ({ ...prev, [reportId]: null }));
    }
  };

  const removeEvidence = (id: string) => setLinkedEvidence(prev => prev.filter(item => item.id !== id));

  const currentReport = reports[currentReportIndex];
  const currentSuspect = currentReport?.suspect;
  const suspectName = [currentSuspect?.firstName, currentSuspect?.lastName].filter(Boolean).join(' ') || '—';
    
  const handleId = "suspicious-person-report-handle";

  if (!open) return null;

  const DesktopLayout = (
    <DraggablePaper 
      handleId={handleId} 
      centerOnMount 
      modalId="suspiciousPersonReport"
      PaperProps={{
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
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }
      }}
    >
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
        <Box sx={{ position: 'relative', overflowY: 'auto', p: { xs: 2, sm: 3 }, pt: 0, flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, position: 'relative' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }} gutterBottom>
              <span style={{ fontWeight: 600 }}>Suspect Name:</span> <span style={{ fontWeight: 400 }}>{suspectName}</span>
            </Typography>
            <Box sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}>
              <Button
                variant="contained"
                color="primary"
                disabled={!linkedDmvRecords[reports[currentReportIndex]?.id] || submitLoading}
                onClick={async () => {
                  setSubmitLoading(true);
                  setSubmitSuccess(null);
                  setSubmitError(null);
                  try {
                    await submitReport(
                      reports[currentReportIndex]?.id,
                      linkedDmvRecords[reports[currentReportIndex]?.id]?.id,
                      [] // evidenceIds, empty for now
                    );
                    setSubmitSuccess('Report submitted!');
                  } catch (err: any) {
                    setSubmitError('Failed to submit report.');
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
                {submitLoading ? 'Submitting...' : 'Submit Report'}
              </Button>
            </Box>
          </Box>
          <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#444' }} gutterBottom>
            <strong>DATE:</strong> {currentReport?.reportDate 
              ? new Date(currentReport.reportDate).toLocaleString('en-US', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit' }) 
              : '—'}
          </Typography>
          <Grid container spacing={1} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.82rem' }}><strong>Alias:</strong> {currentSuspect?.aliases?.join(', ') || '—'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.82rem' }}><strong>SEX:</strong> {currentSuspect?.sex || '—'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.82rem' }}><strong>HEIGHT:</strong> {currentSuspect?.height || '—'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.82rem' }}><strong>HAIR:</strong> {currentSuspect?.hairColor || '—'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.82rem' }}><strong>AGE:</strong> {currentSuspect?.age || '—'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.82rem' }}><strong>WEIGHT:</strong> {currentSuspect?.weight || '—'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.82rem' }}><strong>EYES:</strong> {currentSuspect?.eyeColor || '—'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.82rem' }}><strong>LICENSE PLATE:</strong> {linkedDmvRecords[reports[currentReportIndex]?.id]?.licensePlate || '—'}</Typography>
            </Grid>
          </Grid>
          <Box sx={{ borderBottom: '1px solid #555', mb: 1, pb: 1 }} />
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, textTransform: 'uppercase', fontWeight: 'bold', fontSize: '0.95rem' }}>Report:</Typography>
            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{currentReport?.details}</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
            <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'transparent', border: '1px dashed #555' }}>
              {linkedDmvRecords[reports[currentReportIndex]?.id] ? null : (
                <Typography variant="h6" sx={{ color: '#000', mb: 1, fontWeight: 'bold', fontSize: '1.05rem' }}>DMV Record</Typography>
              )}
              {linkedDmvRecords[reports[currentReportIndex]?.id] ? (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ color: '#000' }}>
                    {linkedDmvRecords[reports[currentReportIndex]?.id].firstName} {linkedDmvRecords[reports[currentReportIndex]?.id].lastName}
                  </Typography>
                  <Button size="small" variant="outlined" color="error" onClick={removeDmvRecord}>Remove</Button>
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: '#555', fontSize: '0.92rem' }}>No record linked.</Typography>
              )}
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'transparent', border: '1px dashed #555' }}>
              <Typography variant="subtitle2" sx={{ color: '#000', mb: 1, fontWeight: 'bold', fontSize: '0.95rem' }}>Evidence</Typography>
              {linkedEvidence.length > 0 ? ( <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}> {linkedEvidence.map(item => ( <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}> <Typography sx={{ color: '#000', fontSize: '0.82rem' }}> <strong>{item.type}:</strong> {item.content.substring(0, 30)}... </Typography> <Button size="small" variant="outlined" color="secondary" onClick={() => removeEvidence(item.id)}>Remove</Button> </Box> ))} </Box> ) : ( <Typography variant="body2" sx={{ color: '#555', fontSize: '0.92rem' }}>No evidence linked.</Typography> )}
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
    </DraggablePaper>
  );

  const MobileLayout = (
    <DraggablePaper 
      handleId={handleId} 
      centerOnMount 
      modalId="suspiciousPersonReport"
      PaperProps={{
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
          maxHeight: '90vh',
          overflow: 'hidden',
        }
      }}
    >
      <Box 
        id={handleId}
        sx={{ cursor: 'move', textAlign: 'center', pt: 2, pb: 1, flexShrink: 0 }}
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
      <Box sx={{ overflowY: 'auto', p: 2, pt: 0, flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }} gutterBottom>
            <span style={{ fontWeight: 600 }}>Suspect Name:</span> <span style={{ fontWeight: 400 }}>{suspectName}</span>
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#444' }} gutterBottom>
                    <strong>DATE:</strong> {currentReport?.reportDate 
            ? new Date(currentReport.reportDate).toLocaleString('en-US', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit' }) 
                        : '—'}
                </Typography>
        <Grid container spacing={1} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.82rem' }}><strong>Alias:</strong> {currentSuspect?.aliases?.join(', ') || '—'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.82rem' }}><strong>SEX:</strong> {currentSuspect?.sex || '—'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.82rem' }}><strong>HEIGHT:</strong> {currentSuspect?.height || '—'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.82rem' }}><strong>HAIR:</strong> {currentSuspect?.hairColor || '—'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.82rem' }}><strong>AGE:</strong> {currentSuspect?.age || '—'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.82rem' }}><strong>WEIGHT:</strong> {currentSuspect?.weight || '—'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.82rem' }}><strong>EYES:</strong> {currentSuspect?.eyeColor || '—'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.82rem' }}><strong>LICENSE PLATE:</strong> {linkedDmvRecords[reports[currentReportIndex]?.id]?.licensePlate || '—'}</Typography>
          </Grid>
        </Grid>
        <Box sx={{ borderBottom: '1px solid #555', mb: 1, pb: 1 }} />
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, textTransform: 'uppercase', fontWeight: 'bold', fontSize: '0.95rem' }}>Report:</Typography>
          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{currentReport?.details}</Typography>
                </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
          <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'transparent', border: '1px dashed #555' }}>
            {linkedDmvRecords[reports[currentReportIndex]?.id] ? null : (
              <Typography variant="h6" sx={{ color: '#000', mb: 1, fontWeight: 'bold', fontSize: '1.05rem' }}>DMV Record</Typography>
            )}
            {linkedDmvRecords[reports[currentReportIndex]?.id] ? (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ color: '#000' }}>
                  {linkedDmvRecords[reports[currentReportIndex]?.id].firstName} {linkedDmvRecords[reports[currentReportIndex]?.id].lastName}
                      </Typography>
                <Button size="small" variant="outlined" color="error" onClick={removeDmvRecord}>Remove</Button>
                  </Box>
                ) : (
              <Typography variant="body2" sx={{ color: '#555', fontSize: '0.92rem' }}>No record linked.</Typography>
                )}
              </Paper>
          <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'transparent', border: '1px dashed #555' }}>
            <Typography variant="subtitle2" sx={{ color: '#000', mb: 1, fontWeight: 'bold', fontSize: '0.95rem' }}>Evidence</Typography>
            {linkedEvidence.length > 0 ? ( <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}> {linkedEvidence.map(item => ( <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}> <Typography sx={{ color: '#000', fontSize: '0.82rem' }}> <strong>{item.type}:</strong> {item.content.substring(0, 30)}... </Typography> <Button size="small" variant="outlined" color="secondary" onClick={() => removeEvidence(item.id)}>Remove</Button> </Box> ))} </Box> ) : ( <Typography variant="body2" sx={{ color: '#555', fontSize: '0.92rem' }}>No evidence linked.</Typography> )}
              </Paper>
            </Box>
      </Box>
      <Box sx={{ px: 1, py: 0, backgroundColor: 'transparent', borderTop: '1px solid rgba(0,0,0,0.12)', flexShrink: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button onClick={handlePrevious} disabled={reports.length <= 1} sx={{ color: '#000' }}> <ArrowBackIcon /> </Button>
          <Typography sx={{ fontSize: '0.7rem' }}>{currentReportIndex + 1} / {reports.length}</Typography>
          <Button onClick={handleNext} disabled={reports.length <= 1} sx={{ color: '#000' }}> <ArrowForwardIcon /> </Button>
          </Box>
      </Box>
      <Box sx={{ position: 'absolute', top: 56, right: 8, zIndex: 10 }}>
        <Button
          variant="contained"
          color="primary"
          disabled={!linkedDmvRecords[reports[currentReportIndex]?.id] || submitLoading}
          onClick={async () => {
            setSubmitLoading(true);
            setSubmitSuccess(null);
            setSubmitError(null);
            try {
              await submitReport(
                reports[currentReportIndex]?.id,
                linkedDmvRecords[reports[currentReportIndex]?.id]?.id,
                [] // evidenceIds, empty for now
              );
              setSubmitSuccess('Report submitted!');
            } catch (err: any) {
              setSubmitError('Failed to submit report.');
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
          {submitLoading ? 'Submitting...' : 'Submit Report'}
        </Button>
      </Box>
    </DraggablePaper>
  );

  return isSmallScreen ? MobileLayout : DesktopLayout;
};

export default SuspiciousPersonReportModal; 
