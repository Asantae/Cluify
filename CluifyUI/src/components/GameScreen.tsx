import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button, Snackbar, Alert } from '@mui/material';
import DesktopIcon from './DesktopIcon';
import CaseViewerModal from '../modals/CaseViewerModal';
import SuspiciousPersonReportModal from '../modals/SuspiciousPersonReportModal';
import DmvSearchModal from '../modals/DmvSearchModal';
import ReceiptsModal from '../modals/ReceiptsModal';
import PhoneRecordsModal from '../modals/PhoneRecordsModal';
import PoliceRecordsModal from '../modals/PoliceRecordsModal';
import WinOverlay from './WinOverlay';
import LockoutOverlay from './LockoutOverlay';
import CaseInactiveOverlay from './CaseInactiveOverlay';
import { Case, Report, DmvRecord } from '../types';
import { getCaseProgress, isLoggedIn, searchAllPhoneData } from '../services/api';
import { useLocalStorage } from '../hooks/useLocalStorage';
import caseViewerIcon from '../assets/case_viewer_icon.png';
import suspiciousPersonReportIcon from '../assets/suspicious_person_report_icon.png';
import dmvSearchIcon from '../assets/dmv_search_icon.png';
import phoneRecordsIcon from '../assets/phone_records_icon.png';
import purchaseRecordsIcon from '../assets/purchase_records_icon.png';
import policeRecordsIcon from '../assets/police_records_icon.png';

interface GameScreenProps {
  activeCase: Case | null;
  reports: Report[];
  isLoading: boolean;
  error: string | null;
  darkMode: boolean;
  setAttemptsUsed: (attempts: number) => void;
  attemptResults: { [caseId: string]: ('correct' | 'incorrect' | 'insufficient')[] };
  setAttemptResults: React.Dispatch<React.SetStateAction<{ [caseId: string]: ('correct' | 'incorrect' | 'insufficient')[] }>>;
  onReturnToMainMenu: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ activeCase, reports, isLoading, error, darkMode, setAttemptsUsed, attemptResults, setAttemptResults, onReturnToMainMenu }) => {
  const [isCaseViewerOpen, setCaseViewerOpen] = useState(false);
  const [isReportViewerOpen, setReportViewerOpen] = useState(false);
  const [isDmvSearchOpen, setDmvSearchOpen] = useState(false);
  const [isPurchaseRecordsOpen, setPurchaseRecordsOpen] = useState(false);
  const [isPhoneRecordsOpen, setPhoneRecordsOpen] = useState(false);
  const [isPoliceRecordsOpen, setPoliceRecordsOpen] = useState(false);

  const [showPhoneHackConfirm, setShowPhoneHackConfirm] = useState(false);
  const [showPhoneHackError, setShowPhoneHackError] = useState(false);
  const [showReceiptsConfirm, setShowReceiptsConfirm] = useState(false);
  const [showReceiptsError, setShowReceiptsError] = useState(false);
  const [currentReportIndex, setCurrentReportIndex] = useState(0);
  const [linkedDmvRecords, setLinkedDmvRecords] = useState<{ [key: string]: DmvRecord }>({});
  const [linkedEvidence, setLinkedEvidence] = useState<{ [key: string]: Array<{ id: string; type: string; content: string }> }>({});
  const [hackAttempts, setHackAttempts] = useState<Set<string>>(new Set());
  const [hackCount, setHackCount] = useState(0);
  const [showWinOverlay, setShowWinOverlay] = useState(false);
  const [showLoseOverlay, setShowLoseOverlay] = useState(false);
  const [evidenceSnackbar, setEvidenceSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

  // Find the suspect from reports
  const suspect = reports.find(report => report.Suspect)?.Suspect;
  
    // Get the DMV record name and PersonId for the active suspect
  const getSuspectInfoFromDmv = () => {
    if (!suspect) {
      return null;
    }

    // Get the DMV record linked to the currently active report
    const currentReportId = reports && reports.length > 0 ? reports[currentReportIndex]?.Id : undefined;
    if (!currentReportId) {
      return null;
    }

    // Get the DMV record that was actually linked to this specific report
    const linkedDmvRecord = linkedDmvRecords[currentReportId];
    if (linkedDmvRecord) {
      const result = {
        name: `${linkedDmvRecord.firstName} ${linkedDmvRecord.lastName}`,
        dmvRecordId: linkedDmvRecord.id
      };
      return result;
    }
    return null;
  };
  
  const suspectInfo = getSuspectInfoFromDmv();
  const suspectDisplayName = suspectInfo?.name || null;
  const suspectDmvRecordId = suspectInfo?.dmvRecordId || null;

  const handlePhoneHackClick = () => {
    if (suspect) {
      if (suspectDisplayName) {
        setShowPhoneHackConfirm(true);
      } else {
        // Show error modal for no DMV record
        setShowPhoneHackError(true);
      }
    } else {
      // Show error message or handle no suspect case
      alert('Must have added a culprit to search their phone');
    }
  };

  const handlePhoneHackConfirm = () => {
    setShowPhoneHackConfirm(false);
    setPhoneRecordsOpen(true);
    
    // Track this hack attempt
    const currentReportId = reports && reports.length > 0 ? reports[currentReportIndex]?.Id : undefined;
    if (currentReportId && suspectDmvRecordId) {
      const phoneHackKey = `phone-${currentReportId}-${suspectDmvRecordId}`;
      const receiptHackKey = `receipt-${currentReportId}-${suspectDmvRecordId}`;
      
      // Check if we've already hacked this DMV record (either phone or receipts)
      const hasHackedThisDmv = hackAttempts.has(phoneHackKey) || hackAttempts.has(receiptHackKey);
      
      if (!hasHackedThisDmv) {
        // This is a new DMV record hack, count it
        setHackAttempts(prev => {
          const newSet = new Set(prev);
          newSet.add(phoneHackKey);
          return newSet;
        });
        
        // Update hack count
        updateHackCount();
        
        // Check if this is the 3rd unique DMV record hack
        const newHackAttempts = new Set([...hackAttempts, phoneHackKey]);
        const uniqueDmvHacks = new Set();
        newHackAttempts.forEach(hackKey => {
          const parts = hackKey.split('-');
          const dmvId = parts[parts.length - 1];
          uniqueDmvHacks.add(dmvId);
        });
        
        if (uniqueDmvHacks.size >= 3) {
          // Trigger a failed attempt
          const currentCaseId = activeCase?.Id || '';
          const currentAttempts = attemptResults[currentCaseId] || [];
          const failedAttempts = currentAttempts.filter(result => result === 'incorrect' || result === 'insufficient').length;
          
          // Add a failed attempt (red for excessive hacking)
          setAttemptResults(prev => ({
            ...prev,
            [currentCaseId]: [...(prev[currentCaseId] || []), 'incorrect']
          }));
          
          // Show notification about excessive hacking
          setEvidenceSnackbar({ open: true, message: 'Excessive hacking detected! Failed attempt added.' });
          
          // Check if this triggers the lose screen
          if (failedAttempts >= 4) {
            setTimeout(() => {
              setShowLoseOverlay(true);
            }, 0);
          }
        }
      }
      // If we've already hacked this DMV record, it's free (no penalty)
    }
  };

  const handleReceiptsClick = () => {
    if (suspect) {
      if (suspectDisplayName) {
        setShowReceiptsConfirm(true);
      } else {
        // Show error modal for no DMV record
        setShowReceiptsError(true);
      }
    } else {
      // Show error message or handle no suspect case
      alert('Must have added a culprit to search their purchase history');
    }
  };

  const handleReceiptsConfirm = () => {
    setShowReceiptsConfirm(false);
    setPurchaseRecordsOpen(true);
    
    // Track this hack attempt
    const currentReportId = reports && reports.length > 0 ? reports[currentReportIndex]?.Id : undefined;
    if (currentReportId && suspectDmvRecordId) {
      const phoneHackKey = `phone-${currentReportId}-${suspectDmvRecordId}`;
      const receiptHackKey = `receipt-${currentReportId}-${suspectDmvRecordId}`;
      
      // Check if we've already hacked this DMV record (either phone or receipts)
      const hasHackedThisDmv = hackAttempts.has(phoneHackKey) || hackAttempts.has(receiptHackKey);
      
      if (!hasHackedThisDmv) {
        // This is a new DMV record hack, count it
        setHackAttempts(prev => {
          const newSet = new Set(prev);
          newSet.add(receiptHackKey);
          return newSet;
        });
        
        // Update hack count
        updateHackCount();
        
        // Check if this is the 3rd unique DMV record hack
        const newHackAttempts = new Set([...hackAttempts, receiptHackKey]);
        const uniqueDmvHacks = new Set();
        newHackAttempts.forEach(hackKey => {
          const parts = hackKey.split('-');
          const dmvId = parts[parts.length - 1];
          uniqueDmvHacks.add(dmvId);
        });
        
        if (uniqueDmvHacks.size >= 3) {
          // Trigger a failed attempt
          const currentCaseId = activeCase?.Id || '';
          const currentAttempts = attemptResults[currentCaseId] || [];
          const failedAttempts = currentAttempts.filter(result => result === 'incorrect' || result === 'insufficient').length;
          
          // Add a failed attempt (red for excessive hacking)
          setAttemptResults(prev => ({
            ...prev,
            [currentCaseId]: [...(prev[currentCaseId] || []), 'incorrect']
          }));
          
          // Show notification about excessive hacking
          setEvidenceSnackbar({ open: true, message: 'Excessive hacking detected! Failed attempt added.' });
          
          // Check if this triggers the lose screen
          if (failedAttempts >= 4) {
            setTimeout(() => {
              setShowLoseOverlay(true);
            }, 0);
          }
        }
      }
      // If we've already hacked this DMV record, it's free (no penalty)
    }
  };

  const handlePoliceRecordsClick = () => {
    setPoliceRecordsOpen(true);
  };

  const handleEvidenceSelect = (record: any, type: string) => {
    const currentReportId = reports && reports.length > 0 ? reports[currentReportIndex]?.Id : undefined;
    if (!currentReportId) return;

    const currentEvidence = linkedEvidence[currentReportId] || [];
    if (currentEvidence.length >= 3) {
      setEvidenceSnackbar({ open: true, message: 'Maximum 3 pieces of evidence allowed per report' });
      return;
    }

    const evidenceId = record.Id;
    const isAlreadySelected = currentEvidence.some(evidence => evidence.id === evidenceId);
    
    if (isAlreadySelected) {
      setEvidenceSnackbar({ open: true, message: 'This evidence is already selected' });
      return;
    }

    const content = type === 'phone' ? record.MessageContent || record.Content || record.Query :
                   type === 'receipt' ? record.ItemBought : '';

    setLinkedEvidence(prev => ({
      ...prev,
      [currentReportId]: [...(prev[currentReportId] || []), {
        id: evidenceId,
        type,
        content: content.substring(0, 50) + (content.length > 50 ? '...' : '')
      }]
    }));

                      setEvidenceSnackbar({ open: true, message: 'Evidence added to report' });
    
    // Open the report modal when evidence is selected
    if (!isReportViewerOpen) {
      setReportViewerOpen(true);
    }
  };



  const handleEvidenceSnackbarClose = () => setEvidenceSnackbar({ open: false, message: '' });

  const updateHackCount = () => {
    setHackCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 3) {
        return 0; // Reset to 0 when reaching 3
      }
      return newCount;
    });
  };

  const maxAttempts = 5;
  const userId = isLoggedIn() ? localStorage.getItem('userId') : null;
  const [localAttempts, setLocalAttempts] = useLocalStorage<number>(`case_attempts_${activeCase?.Id || ''}`, 0);
  const [progress, setProgress] = useState<{ attempts: number; hasWon: boolean } | null>(null);

  useEffect(() => {
    if (activeCase && isLoggedIn() && userId) {
      getCaseProgress(userId, String(activeCase.Id)).then((data) => {
        if (data && typeof data.attempts === 'number') {
          setProgress({ attempts: data.attempts, hasWon: !!data.hasWon });
          setAttemptsUsed(data.attempts);
        } else {
          setProgress({ attempts: 0, hasWon: false });
          setAttemptsUsed(0);
        }
      }).catch(() => {
        setProgress({ attempts: 0, hasWon: false });
        setAttemptsUsed(0);
      });
    } else if (activeCase && !isLoggedIn()) {
      setProgress(null);
      setAttemptsUsed(0);
      setLocalAttempts(0);
    }
  }, [activeCase?.Id]);

  useEffect(() => {
    if (activeCase) {
      setCaseViewerOpen(true);
      // Reset hack attempts for new case
      setHackAttempts(new Set());
      // Reset hack count for new case
      setHackCount(0);
    }
  }, [activeCase]);

  // Only show overlays for tracked (active) cases (not practice)
  const isTrackedCase = !!activeCase && !activeCase.CanBePractice;
  // Show overlays for both tracked (active) cases and practice cases
  const showWin = (!!progress?.hasWon || showWinOverlay);
  const showLockout = ((isLoggedIn() ? (progress?.attempts ?? 0) >= maxAttempts : localAttempts >= maxAttempts) && !progress?.hasWon) || showLoseOverlay;
  const showInactive = isTrackedCase && !activeCase.IsActive;

  useEffect(() => {
    if (isLoading || error) {
      setAttemptsUsed(0);
    }
  }, [isLoading, error, setAttemptsUsed]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        py: 4,
        height: 'calc(100vh - 128px)', // Account for header and footer
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: !activeCase ? 'center' : 'flex-start',
        justifyContent: !activeCase ? 'center' : 'flex-start',
        gap: 2,
        px: { xs: 1, sm: 2 },
        ...(activeCase && { minWidth: '600px' }), // Horizontal scroll for smaller screens
      }}
    >
      {/* Submission Tracker and Hack Counter */}
      {activeCase && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 0.5,
            mt: 0.5,
            px: 3,
            gap: 4,
          }}
        >
          {/* Submission Tracker */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {Array.from({ length: 5 }, (_, index) => {
              const currentCaseId = activeCase?.Id || '';
              const currentAttempts = attemptResults[currentCaseId] || [];
              const status = currentAttempts[index] || 'empty';
              
              let color = '#666';
              if (status === 'correct') color = '#4caf50';
              else if (status === 'incorrect') color = '#f44336';
              else if (status === 'insufficient') color = '#ff9800';
              
              return (
                <Box
                  key={index}
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '4px',
                    backgroundColor: color,
                    border: `2px solid ${color === '#666' ? '#444' : color}`,
                  }}
                />
              );
            })}
          </Box>

          {/* Hack Counter */}
          <Typography
            variant="body2"
            sx={{
              color: hackCount === 0 ? '#fff' : hackCount === 1 ? '#ffeb3b' : '#f44336',
              fontWeight: 500,
              fontSize: '0.85rem',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              opacity: 0.8,
            }}
          >
            {hackCount}/3 hacks
          </Typography>
        </Box>
      )}
      
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'nowrap',
          alignItems: !activeCase ? 'center' : 'flex-start',
          justifyContent: !activeCase ? 'center' : 'flex-start',
          gap: 2,
          flex: 1,
        }}
      >
        {!activeCase ? (
            <Box sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center' }}>
                <Typography variant="h4" component="h2" fontWeight="bold" mb={2}>
                    No Active Case Found
                </Typography>
                <Typography>
                    There is no active case to investigate at the moment. Please check back later.
                </Typography>
            </Box>
        ) : (
            <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: {
                    xs: 'repeat(2, 1fr)',
                    sm: 'repeat(3, 1fr)', 
                    md: 'repeat(4, 1fr)'
                },
                gap: 2,
                maxWidth: '100%',
                justifyContent: 'center',
                alignItems: 'start',
                p: 2
            }}>
                <DesktopIcon
                    icon={caseViewerIcon}
                    label="Case Viewer"
                    onClick={() => setCaseViewerOpen(true)}
                    darkMode={darkMode}
                />
                <DesktopIcon
                    icon={suspiciousPersonReportIcon}
                    label="Suspicious Person Reports"
                    onClick={() => setReportViewerOpen(true)}
                    darkMode={darkMode}
                />
                <DesktopIcon
                    icon={dmvSearchIcon}
                    label="D.M.V DB"
                    onClick={() => setDmvSearchOpen(true)}
                    darkMode={darkMode}
                />
                <DesktopIcon
                    icon={phoneRecordsIcon}
                    label="Phone Hacker"
                    onClick={handlePhoneHackClick}
                    darkMode={darkMode}
                />
                                  <DesktopIcon
                      icon={purchaseRecordsIcon}
                      label="PurchaseHacker"
                      onClick={handleReceiptsClick}
                      darkMode={darkMode}
                  />
                <DesktopIcon
                    icon={policeRecordsIcon}
                    label="ConvictScan"
                    onClick={handlePoliceRecordsClick}
                    darkMode={darkMode}
                />
            </Box>
        )}
      </Box>



        {activeCase && (
            <CaseViewerModal
                open={isCaseViewerOpen}
                onClose={() => setCaseViewerOpen(false)}
                caseData={activeCase}
                darkMode={darkMode}
            />
        )}
        
        {activeCase && reports && reports.length > 0 && (
            <SuspiciousPersonReportModal
                open={isReportViewerOpen}
                onClose={() => setReportViewerOpen(false)}
                reports={reports}
                darkMode={darkMode}
                currentReportIndex={currentReportIndex}
                setCurrentReportIndex={setCurrentReportIndex}
                linkedDmvRecords={linkedDmvRecords}
                setLinkedDmvRecords={setLinkedDmvRecords}
                linkedEvidence={linkedEvidence}
                setLinkedEvidence={setLinkedEvidence}
                setAttemptResults={setAttemptResults}
                onClosePhoneModal={() => setPhoneRecordsOpen(false)}
                onCloseReceiptModal={() => setPurchaseRecordsOpen(false)}
                onReportSubmitted={() => {
                  if (activeCase && isLoggedIn() && userId) {
                    getCaseProgress(userId, String(activeCase.Id)).then((data) => {
                      if (data && typeof data.attempts === 'number') {
                        setProgress({ attempts: data.attempts, hasWon: !!data.hasWon });
                        setAttemptsUsed(data.attempts);
                      } else {
                        setProgress({ attempts: 0, hasWon: false });
                        setAttemptsUsed(0);
                      }
                    });
                  } else if (activeCase && !isLoggedIn()) {
                    setLocalAttempts(prev => {
                      setAttemptsUsed(prev + 1);
                      return prev + 1;
                    });
                  }
                }}
                onSuccessfulSubmission={() => {
                  // Defer the state update to avoid React render cycle issues
                  setTimeout(() => {
                    setShowWinOverlay(true);
                  }, 0);
                }}
                onFailedSubmission={() => {
                  // Check if we have 4 failed attempts (incorrect + insufficient) (will be 5th after this one)
                  const currentCaseId = activeCase?.Id || '';
                  const currentAttempts = attemptResults[currentCaseId] || [];
                  const failedAttempts = currentAttempts.filter(result => result === 'incorrect' || result === 'insufficient').length;
                  if (failedAttempts >= 4) {
                    // Defer the state update to avoid React render cycle issues
                    setTimeout(() => {
                      setShowLoseOverlay(true);
                    }, 0);
                  }
                }}
            />
        )}

        {activeCase && (
            <DmvSearchModal
                open={isDmvSearchOpen}
                onClose={() => setDmvSearchOpen(false)}
                darkMode={darkMode}
                currentReportId={String(reports && reports.length > 0 ? reports[currentReportIndex]?.Id : '')}
                onSelectDmvRecord={(record) => {
                  const reportId = reports && reports.length > 0 ? reports[currentReportIndex]?.Id : undefined;
                  if (reportId) {
                    setLinkedDmvRecords(prev => ({ ...prev, [reportId]: record }));
                    // Clear all linked evidence when a new DMV record is selected
                    setLinkedEvidence(prev => ({ ...prev, [reportId]: [] }));
                  }
                  if (!isReportViewerOpen) setReportViewerOpen(true);
                }}
            />
        )}

        {activeCase && (
            <PhoneRecordsModal
                open={isPhoneRecordsOpen}
                onClose={() => setPhoneRecordsOpen(false)}
                phoneOwnerName={suspectDisplayName}
                onLoadPhoneData={async () => {
                  if (!suspectDmvRecordId) {
                    throw new Error('No phone owner DmvRecordId available');
                  }
                  
                  const data = await searchAllPhoneData(suspectDmvRecordId);
                  return data;
                }}
                onSelectRecord={(record) => {
                  handleEvidenceSelect(record, 'phone');
                }}
            />
        )}

        {activeCase && (
            <ReceiptsModal
                open={isPurchaseRecordsOpen}
                onClose={() => setPurchaseRecordsOpen(false)}
                darkMode={darkMode}
                phoneOwnerName={suspectDisplayName}
                personId={suspectDmvRecordId}
                onSelectRecord={(record) => {
                  handleEvidenceSelect(record, 'receipt');
                }}
            />
        )}

        {activeCase && (
                            <PoliceRecordsModal
                  open={isPoliceRecordsOpen}
                  onClose={() => setPoliceRecordsOpen(false)}
                  dmvRecordId={suspectDmvRecordId}
                  dmvRecord={Object.values(linkedDmvRecords)[0] || null}
                  onSelectRecord={(record) => {
                    handleEvidenceSelect(record, 'police');
                  }}
                />
        )}

        {showWin && <WinOverlay onClose={onReturnToMainMenu} />}
        {showLockout && <LockoutOverlay onReturn={onReturnToMainMenu} />}
        {showInactive && <CaseInactiveOverlay onClose={onReturnToMainMenu} />}

        {/* Phone Hack Confirmation Dialog */}
        <Dialog
            open={showPhoneHackConfirm}
            onClose={() => setShowPhoneHackConfirm(false)}
            PaperProps={{
                sx: {
                    backgroundColor: darkMode ? '#222' : '#fff',
                    color: darkMode ? '#fff' : '#000',
                    minWidth: { xs: '90vw', sm: 400 },
                    maxWidth: '95vw'
                }
            }}
        >
            <DialogTitle sx={{ 
                textAlign: 'center', 
                fontWeight: 'bold',
                borderBottom: `1px solid ${darkMode ? '#444' : '#ddd'}`
            }}>
                Phone Hacker
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
                <Typography sx={{ textAlign: 'center', mb: 2 }}>
                    Are you sure you want to hack {suspectDisplayName}'s phone?
                </Typography>
            </DialogContent>
            <DialogActions sx={{ 
                justifyContent: 'center', 
                gap: 2, 
                p: 2,
                borderTop: `1px solid ${darkMode ? '#444' : '#ddd'}`
            }}>
                <Button 
                    onClick={() => setShowPhoneHackConfirm(false)}
                    variant="outlined"
                    sx={{ 
                        color: darkMode ? '#fff' : '#000',
                        borderColor: darkMode ? '#888' : '#ccc',
                        borderWidth: '2px',
                        '&:hover': {
                            borderColor: darkMode ? '#aaa' : '#999',
                            borderWidth: '2px'
                        }
                    }}
                >
                    No
                </Button>
                <Button 
                    onClick={handlePhoneHackConfirm}
                    variant="contained"
                    sx={{ 
                        backgroundColor: darkMode ? '#0d47a1' : '#1976d2',
                        color: '#fff',
                        '&:hover': {
                            backgroundColor: darkMode ? '#0a3d8f' : '#1565c0'
                        }
                    }}
                >
                    Yes
                </Button>
            </DialogActions>
        </Dialog>

        {/* Access Denied Error Dialog */}
        <Dialog
            open={showPhoneHackError || showReceiptsError}
            onClose={() => {
                setShowPhoneHackError(false);
                setShowReceiptsError(false);
            }}
            PaperProps={{
                sx: {
                    backgroundColor: darkMode ? '#222' : '#fff',
                    color: darkMode ? '#fff' : '#000',
                    minWidth: { xs: '90vw', sm: 400 },
                    maxWidth: '95vw'
                }
            }}
        >
            <DialogTitle sx={{ 
                textAlign: 'center', 
                fontWeight: 'bold',
                borderBottom: `1px solid ${darkMode ? '#444' : '#ddd'}`
            }}>
                Access Denied
            </DialogTitle>
            <DialogContent sx={{ pt: 2, pb: 1, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ textAlign: 'center' }}>
                    A DMV record must be linked to the suspect profile before {showPhoneHackError ? 'phone records' : 'purchase history'} can be accessed.
                </Typography>
            </DialogContent>
            <DialogActions sx={{ 
                justifyContent: 'center', 
                p: 2,
                borderTop: `1px solid ${darkMode ? '#444' : '#ddd'}`
            }}>
                <Button 
                    onClick={() => {
                        setShowPhoneHackError(false);
                        setShowReceiptsError(false);
                    }}
                    variant="contained"
                    sx={{ 
                        backgroundColor: darkMode ? '#0d47a1' : '#1976d2',
                        color: '#fff',
                        '&:hover': {
                            backgroundColor: darkMode ? '#0a3d8f' : '#1565c0'
                        }
                    }}
                >
                    Understood
                </Button>
            </DialogActions>
        </Dialog>

        {/* Recent Receipts Confirmation Dialog */}
        <Dialog
            open={showReceiptsConfirm}
            onClose={() => setShowReceiptsConfirm(false)}
            PaperProps={{
                sx: {
                    backgroundColor: darkMode ? '#222' : '#fff',
                    color: darkMode ? '#fff' : '#000',
                    minWidth: { xs: '90vw', sm: 400 },
                    maxWidth: '95vw'
                }
            }}
        >
            <DialogTitle sx={{ 
                textAlign: 'center', 
                fontWeight: 'bold',
                borderBottom: `1px solid ${darkMode ? '#444' : '#ddd'}`
            }}>
                PurchaseHacker
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
                <Typography sx={{ textAlign: 'center', mb: 2 }}>
                    Are you sure you want to hack {suspectDisplayName}'s purchase history?
                </Typography>
            </DialogContent>
            <DialogActions sx={{ 
                justifyContent: 'center', 
                gap: 2, 
                p: 2,
                borderTop: `1px solid ${darkMode ? '#444' : '#ddd'}`
            }}>
                <Button 
                    onClick={() => setShowReceiptsConfirm(false)}
                    variant="outlined"
                    sx={{ 
                        color: darkMode ? '#fff' : '#000',
                        borderColor: darkMode ? '#888' : '#ccc',
                        borderWidth: '2px',
                        '&:hover': {
                            borderColor: darkMode ? '#aaa' : '#999',
                            borderWidth: '2px'
                        }
                    }}
                >
                    No
                </Button>
                <Button 
                    onClick={handleReceiptsConfirm}
                    variant="contained"
                    sx={{ 
                        backgroundColor: darkMode ? '#0d47a1' : '#1976d2',
                        color: '#fff',
                        '&:hover': {
                            backgroundColor: darkMode ? '#0a3d8f' : '#1565c0'
                        }
                    }}
                >
                    Yes
                </Button>
            </DialogActions>
        </Dialog>

        {/* Evidence Snackbar */}
        <Snackbar
          open={evidenceSnackbar.open}
          autoHideDuration={3000}
          onClose={handleEvidenceSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleEvidenceSnackbarClose} severity="info" sx={{ width: '100%' }}>
            {evidenceSnackbar.message}
          </Alert>
        </Snackbar>

    </Box>
  );
};

export default GameScreen; 