import React, { useState, useEffect } from 'react';
import { Case, Report } from '../types';
import { Box, Typography, CircularProgress } from '@mui/material';
import DesktopIcon from './DesktopIcon';
import CaseViewerModal from '../modals/CaseViewerModal';
import SuspiciousPersonReportModal from '../modals/SuspiciousPersonReportModal';
import DmvSearchModal from '../modals/DmvSearchModal';

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
}

const GameScreen: React.FC<GameScreenProps> = ({ activeCase, reports, isLoading, error, darkMode }) => {
  const [isCaseViewerOpen, setCaseViewerOpen] = useState(false);
  const [isReportViewerOpen, setReportViewerOpen] = useState(false);
  const [isDmvSearchOpen, setDmvSearchOpen] = useState(false);

  useEffect(() => {
    if (activeCase) {
      setCaseViewerOpen(true);
    }
  }, [activeCase]);

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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
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
            />
        )}

        {activeCase && (
            <DmvSearchModal
                open={isDmvSearchOpen}
                onClose={() => setDmvSearchOpen(false)}
                darkMode={darkMode}
            />
        )}
    </Box>
  );
};

export default GameScreen; 