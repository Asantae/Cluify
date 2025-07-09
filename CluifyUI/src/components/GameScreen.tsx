import React, { useState, useEffect } from 'react';
import { Case, Report } from '../types';
import { Box, Typography, CircularProgress } from '@mui/material';
import DesktopIcon from './DesktopIcon';
import CaseViewerModal from '../modals/CaseViewerModal';
import SuspiciousPersonReportModal from '../modals/SuspiciousPersonReportModal';
import DmvSearchModal from '../modals/DmvSearchModal';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getCaseProgress, isLoggedIn } from '../services/api';
import WinOverlay from './WinOverlay';
import LockoutOverlay from './LockoutOverlay';
import CaseInactiveOverlay from './CaseInactiveOverlay';

// Import your icons
import caseViewerIcon from '../assets/case_viewer_icon.png';
import suspiciousPersonReportIcon from '../assets/suspicious_person_report_icon.png';
import dmvSearchIcon from '../assets/dmv_search_icon.png';

interface GameScreenProps {
  activeCase: Case | null;
  reports: Report[];
  isLoading: boolean;
  error: string | null;
  darkMode: boolean;
  setAttemptsUsed: (attempts: number) => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ activeCase, reports, isLoading, error, darkMode, setAttemptsUsed }) => {
  const [isCaseViewerOpen, setCaseViewerOpen] = useState(false);
  const [isReportViewerOpen, setReportViewerOpen] = useState(false);
  const [isDmvSearchOpen, setDmvSearchOpen] = useState(false);
  const [currentReportIndex, setCurrentReportIndex] = useState(0);
  const [linkedDmvRecords, setLinkedDmvRecords] = useState<{ [reportId: string]: any | null }>({});

  const maxAttempts = 5;
  const userId = isLoggedIn() ? localStorage.getItem('userId') : null;
  const [localAttempts, setLocalAttempts] = useLocalStorage<number>(`case_attempts_${activeCase?.id || ''}`, 0);
  const [progress, setProgress] = useState<{ attempts: number; hasWon: boolean } | null>(null);

  useEffect(() => {
    if (activeCase && isLoggedIn() && userId) {
      getCaseProgress(userId, String(activeCase.id)).then((data) => {
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
  }, [activeCase?.id]);

  useEffect(() => {
    if (activeCase) {
      setCaseViewerOpen(true);
    }
  }, [activeCase]);

  // Only show overlays for tracked (active) cases (not practice)
  const isTrackedCase = !!activeCase && !activeCase.canBePractice;
  const showWin = isTrackedCase && !!progress?.hasWon;
  const showLockout = isTrackedCase && (isLoggedIn() ? (progress?.attempts ?? 0) >= maxAttempts : localAttempts >= maxAttempts) && !progress?.hasWon;
  const showInactive = isTrackedCase && !activeCase.isActive;

  // Navigation handler for 'Return' button
  const goToPlayView = () => {
    window.location.href = '/'; // Replace with your actual play view route if different
  };

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
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: !activeCase ? 'center' : 'flex-start',
        justifyContent: !activeCase ? 'center' : 'flex-start',
        gap: 2,
        px: { xs: 1, sm: 2 },
        ...(activeCase && { minWidth: '600px' }), // Horizontal scroll for smaller screens
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
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
            </Box>
        )}

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
                onReportSubmitted={() => {
                  if (activeCase && isLoggedIn() && userId) {
                    getCaseProgress(userId, String(activeCase.id)).then((data) => {
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
            />
        )}

        {activeCase && (
            <DmvSearchModal
                open={isDmvSearchOpen}
                onClose={() => setDmvSearchOpen(false)}
                darkMode={darkMode}
                currentReportId={String(reports && reports.length > 0 ? reports[currentReportIndex]?.id : '')}
                onSelectDmvRecord={(record) => {
                  const reportId = reports && reports.length > 0 ? reports[currentReportIndex]?.id : undefined;
                  if (reportId) {
                    setLinkedDmvRecords(prev => ({ ...prev, [reportId]: record }));
                  }
                  if (!isReportViewerOpen) setReportViewerOpen(true);
                }}
            />
        )}

        {showWin && <WinOverlay />}
        {showLockout && <LockoutOverlay onReturn={goToPlayView} />}
        {showInactive && <CaseInactiveOverlay onClose={goToPlayView} />}
    </Box>
  );
};

export default GameScreen; 