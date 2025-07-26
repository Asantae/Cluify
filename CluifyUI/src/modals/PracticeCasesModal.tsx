import { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { getPracticeCases } from '../services/api';

interface Case {
  Id: string;
  CaseNumber: number;
  Title: string;
}

interface PracticeCasesModalProps {
  open: boolean;
  onClose: () => void;
  onSelectCase: (caseId: string) => void;
  darkMode: boolean;
}

const PracticeCasesModal = ({ open, onClose, onSelectCase, darkMode }: PracticeCasesModalProps) => {
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      const fetchCases = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const data = await getPracticeCases();
          setCases(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
          setIsLoading(false);
        }
      };
      fetchCases();
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, background: darkMode ? '#222' : '#fff', color: darkMode ? '#fff' : '#222' } }}>
      <DialogTitle sx={{ fontWeight: 700, textAlign: 'center' }}>Select a Practice Case</DialogTitle>
      <DialogContent>
        {isLoading && <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />}
        {error && <Typography color="error" sx={{ textAlign: 'center' }}>{error}</Typography>}
        {!isLoading && !error && (
          <List>
            {cases.map((c) => (
              <ListItem key={c.Id} disablePadding>
                <ListItemButton onClick={() => onSelectCase(c.Id)}>
                  <ListItemText primary={`Case #${c.CaseNumber}: ${c.Title}`} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PracticeCasesModal; 