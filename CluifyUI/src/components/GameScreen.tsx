import React from 'react';
import { Case, Report } from '../types';
import { Box, Typography, Container, CircularProgress, Paper, Grid } from '@mui/material';

interface GameScreenProps {
  activeCase: Case | null;
  reports: Report[];
  isLoading: boolean;
  error: string | null;
}

const GameScreen: React.FC<GameScreenProps> = ({ activeCase, reports, isLoading, error }) => {
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
    <Box component="main" sx={{ flexGrow: 1, py: 4 }}>
      <Container maxWidth="lg">
        {!activeCase ? (
          <div>
            <Typography variant="h4" component="h2" fontWeight="bold" mb={2}>
              No Active Case Found
            </Typography>
            <Typography color="text.secondary">
              There is no active case to investigate at the moment. Please check back later.
            </Typography>
          </div>
        ) : (
          <div>
            <Typography variant="h3" component="h2" fontWeight="bold" mb={1} textAlign="center">
              {activeCase.title}
            </Typography>
            <Typography variant="h6" color="text.secondary" mb={4} textAlign="center">
              {activeCase.description}
            </Typography>
            <Grid container spacing={3}>
              {reports.map((report) => (
                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={report.id}>
                  <Paper elevation={2} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Typography variant="h6" component="h3" fontWeight="bold" borderBottom={1} borderColor="divider" pb={1} mb={1}>
                      Witness Report
                    </Typography>
                    <Typography variant="body1" fontStyle="italic" sx={{ flexGrow: 1 }}>
                      "{report.details}"
                    </Typography>
                    <Typography variant="caption" color="text.secondary" mt={2} textAlign="right">
                      {new Date(report.reportDate).toLocaleString()}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </div>
        )}
      </Container>
    </Box>
  );
};

export default GameScreen; 