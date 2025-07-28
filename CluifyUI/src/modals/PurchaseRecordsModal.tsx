import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  IconButton,
  Paper,
  CircularProgress,
  Chip,
  DialogTitle,
  TablePagination
} from '@mui/material';
import DraggablePaper from '../components/DraggablePaper';
import CloseIcon from '@mui/icons-material/Close';

import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { searchPurchaseRecords } from '../services/api';

interface PurchaseRecord {
  Id: string;
  PersonId: string;
  ItemName: string;
  PurchaseDate: string;
  Amount: number;
  Store: string;
  EvidenceValue: number;
  PersonName?: string;
}

interface PurchaseRecordsModalProps {
  open: boolean;
  onClose: () => void;
  darkMode: boolean;
  onSelectRecord: (record: PurchaseRecord) => void;
}

interface PurchaseRecordsResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: PurchaseRecord[];
  darkMode: boolean;
  onRowClick?: (record: PurchaseRecord) => void;
}

const PurchaseRecordsResultsModal: React.FC<PurchaseRecordsResultsModalProps> = ({ 
  isOpen, 
  onClose, 
  results, 
  darkMode, 
  onRowClick 
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (!isOpen) return null;

  const paginatedResults = results.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const handleId = "purchase-records-results-modal-handle";

  const titleBgColor = darkMode ? '#333' : '#f0f0f0';
  const contentBgColor = darkMode ? '#222' : '#fff';
  const textColor = darkMode ? '#fff' : '#000';
  const borderColor = darkMode ? '#444' : '#ddd';
  const modalBgColor = darkMode ? '#222' : '#fff';

  return (
    <DraggablePaper 
      modalId="purchaseRecordsResults" 
      handleId={handleId} 
      PaperProps={{
        sx: {
          width: { xs: '95vw', sm: '90vw', md: '80vw', lg: '70vw' },
          maxWidth: '1200px',
          height: { xs: '80vh', sm: '75vh' },
          maxHeight: '800px',
          backgroundColor: modalBgColor,
        }
      }}
    >
      <DialogTitle style={{ cursor: 'move', backgroundColor: titleBgColor, color: textColor, borderBottom: `1px solid ${borderColor}` }} id={handleId}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShoppingCartOutlinedIcon />
                      <Typography sx={{ fontWeight: 'bold' }}>{results.length} Recent Receipts Results</Typography>
        </Box>
        <IconButton aria-label="close" onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8, color: textColor }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Box sx={{ p: 2, flexGrow: 1, minHeight: 0, backgroundColor: modalBgColor }}>
        <Typography 
          variant="body2" 
          sx={{ 
            color: textColor, 
            opacity: 0.7, 
            mb: 2, 
            textAlign: 'center',
            fontStyle: 'italic'
          }}
        >
          Click a record to add as evidence
        </Typography>
        <Box sx={{ 
          overflowX: 'auto', 
          maxWidth: '100%',
          '&::-webkit-scrollbar': {
            height: '8px'
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: darkMode ? '#333' : '#f0f0f0'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: darkMode ? '#666' : '#ccc',
            borderRadius: '4px'
          }
        }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {paginatedResults.map((record) => (
              <Paper
                key={record.Id}
                variant="outlined"
                sx={{
                  p: 2,
                  backgroundColor: darkMode ? '#333' : '#fafafa',
                  border: '1px solid',
                  borderColor: darkMode ? '#555' : '#e0e0e0',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: darkMode ? '#444' : '#f0f0f0',
                    borderColor: darkMode ? '#666' : '#ccc',
                  },
                }}
                onClick={() => onRowClick?.(record)}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ShoppingCartOutlinedIcon sx={{ fontSize: 16, color: darkMode ? '#ccc' : '#666' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: textColor }}>
                      {record.PersonName || 'Unknown Person'}
                    </Typography>
                  </Box>
                  <Chip 
                    label={`Evidence: ${record.EvidenceValue}`}
                    size="small"
                    color={record.EvidenceValue >= 70 ? 'error' : record.EvidenceValue >= 40 ? 'warning' : 'default'}
                    sx={{ fontSize: '0.7rem' }}
                  />
                </Box>
                
                <Typography variant="body2" sx={{ mb: 1, color: textColor, lineHeight: 1.4 }}>
                  <strong>Item:</strong> {record.ItemName}
                </Typography>
                
                <Typography variant="body2" sx={{ mb: 1, color: textColor, lineHeight: 1.4 }}>
                  <strong>Store:</strong> {record.Store}
                </Typography>
                
                <Typography variant="body2" sx={{ mb: 1, color: textColor, lineHeight: 1.4 }}>
                  <strong>Amount:</strong> ${record.Amount.toFixed(2)}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: darkMode ? '#aaa' : '#666' }}>
                    {new Date(record.PurchaseDate).toLocaleDateString()} at {new Date(record.PurchaseDate).toLocaleTimeString()}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>
      </Box>
      {results.length > 10 && (
        <Box sx={{ position: { xs: 'sticky', sm: 'static' }, bottom: 0, left: 0, right: 0, zIndex: 2, backgroundColor: contentBgColor, borderTop: '1px solid', borderColor: 'divider' }}>
          <TablePagination
            rowsPerPageOptions={[10, 25]}
            component="div"
            count={results.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Rows:"
            sx={{ color: textColor, backgroundColor: 'inherit' }}
          />
        </Box>
      )}
    </DraggablePaper>
  );
};

const PurchaseRecordsModal: React.FC<PurchaseRecordsModalProps> = ({ 
  open,
  onClose, 
  darkMode, 
  onSelectRecord 
}) => {
  const [searchName, setSearchName] = useState('');
  const [searchResults, setSearchResults] = useState<PurchaseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);

  const handleSearch = async () => {
    if (!searchName.trim()) return;
    
    setIsLoading(true);
    
    
    try {
      const results = await searchPurchaseRecords(searchName.trim());
      setSearchResults(results);
      setIsResultsModalOpen(true);
    } catch (error) {
      // Error searching purchase records
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRecord = (record: PurchaseRecord) => {
    onSelectRecord(record);
    onClose();
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCloseResults = () => {
    setIsResultsModalOpen(false);
    setSearchResults([]);
  };

  const modalBgColor = darkMode ? '#222' : '#fff';
  const textColor = darkMode ? '#fff' : '#000';
  const inputBgColor = darkMode ? '#555' : '#f5f5f5';
  const titleBgColor = darkMode ? '#333' : '#f0f0f0';
  const borderColor = darkMode ? '#444' : '#ddd';
  const handleId = "purchase-records-search-handle";

  return (
    <>
      {open && (
        <DraggablePaper 
          modalId="purchaseRecordsModal" 
          handleId={handleId}
          PaperProps={{
            sx: {
              backgroundColor: modalBgColor,
              color: textColor,
              width: { xs: '95vw', sm: 600, md: 700 },
              maxWidth: '95vw',
              maxHeight: '80vh',
              overflow: 'hidden',
            }
          }}
        >
          <DialogTitle sx={{ minHeight: 36, height: 36, paddingTop: 0, paddingBottom: 0, fontSize: '1rem', backgroundColor: titleBgColor, color: textColor, borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: 1, position: 'relative' }} id={handleId}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShoppingCartOutlinedIcon fontSize='small' />
              <Typography fontSize='1rem' fontWeight={600} sx={{ ml: 1 }}>Recent Receipts Search</Typography>
            </Box>
            <IconButton aria-label="close" onClick={onClose} sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: textColor }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          
          <Box sx={{ flexGrow: 1, minHeight: 0, overflowY: 'auto', p: { xs: 2, sm: 3 }, maxHeight: { xs: '60vh', sm: 'none' }, backgroundColor: modalBgColor }}>
            <Box sx={{ mx: 'auto', maxWidth: '350px' }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
                <TextField
                  fullWidth
                  label="Search by name"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: inputBgColor,
                      color: textColor,
                      '& fieldset': {
                        borderColor: darkMode ? '#666' : '#ccc',
                      },
                      '&:hover fieldset': {
                        borderColor: darkMode ? '#888' : '#999',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: darkMode ? '#fff' : '#1976d2',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: darkMode ? '#ccc' : '#666',
                    },
                    '& .MuiInputBase-input': {
                      color: textColor,
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>

          <Box sx={{ p: { xs: 1, sm: 2 }, pt: 0.5, borderTop: `1px solid ${borderColor}`, minHeight: 40, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'stretch', borderRadius: 0 }}>
            <Button 
              fullWidth 
              variant="contained" 
              onClick={handleSearch} 
              disabled={!searchName.trim() || isLoading} 
              sx={{ borderRadius: 0 }}
            >
              {isLoading ? <CircularProgress size={20} color="inherit" /> : 'SEARCH'}
            </Button>
          </Box>
        </DraggablePaper>
      )}

      {isResultsModalOpen && searchResults.length > 0 && (
        <PurchaseRecordsResultsModal 
          isOpen={isResultsModalOpen} 
          onClose={handleCloseResults} 
          results={searchResults} 
          darkMode={darkMode} 
          onRowClick={handleSelectRecord} 
        />
      )}
    </>
  );
};

export default PurchaseRecordsModal; 