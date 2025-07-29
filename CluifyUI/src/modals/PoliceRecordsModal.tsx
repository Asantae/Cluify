import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  IconButton,
  Chip,
  Pagination,
} from '@mui/material';
import { Close as CloseIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import DraggablePaper from '../components/DraggablePaper';
import { searchPoliceRecords } from '../services/api';
import { PersonWithPoliceRecords, PoliceRecord } from '../types';
import paperTexture from '../assets/paper_texture.png';

interface PoliceRecordsModalProps {
  open: boolean;
  onClose: () => void;
  dmvRecordId: string | null;
  dmvRecord: any | null;
  onSelectRecord?: (record: any) => void;
}

type ModalMode = 'search' | 'people' | 'records';

const PoliceRecordsModal = ({ open, onClose, dmvRecordId, dmvRecord, onSelectRecord }: PoliceRecordsModalProps) => {
  const [mode, setMode] = useState<ModalMode>('search');
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [people, setPeople] = useState<PersonWithPoliceRecords[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<PersonWithPoliceRecords | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const isSmallScreen = window.innerWidth < 768;
  const borderColor = 'rgba(0,0,0,0.3)';

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const getOffenseOutcome = (offense: string): string => {
    const lowerOffense = offense.toLowerCase();
    if (lowerOffense.includes('convicted') || lowerOffense.includes('guilty')) return 'Convicted';
    if (lowerOffense.includes('dismissed') || lowerOffense.includes('dropped')) return 'Dismissed';
    if (lowerOffense.includes('pending') || lowerOffense.includes('trial')) return 'Pending';
    return 'Unknown';
  };

  const getSentence = (offense: string): string => {
    const lowerOffense = offense.toLowerCase();
    if (lowerOffense.includes('jail') || lowerOffense.includes('prison')) {
      const match = offense.match(/(\d+)\s*(day|month|year)/i);
      if (match) return `${match[1]} ${match[2]}${match[2] === 'day' ? 's' : match[2] === 'month' ? 's' : 's'} jail`;
    }
    if (lowerOffense.includes('probation')) {
      const match = offense.match(/(\d+)\s*(month|year)/i);
      if (match) return `${match[1]} ${match[2]}${match[2] === 'month' ? 's' : 's'} probation`;
    }
    if (lowerOffense.includes('fine')) {
      const match = offense.match(/\$(\d+)/);
      if (match) return `$${match[1]} fine`;
    }
    return '';
  };

  const handleSearch = async () => {
    if (!firstName.trim() && !lastName.trim()) return;
    
    setLoading(true);
    try {
      const results = await searchPoliceRecords(firstName, lastName);
      setPeople(results);
      setCurrentPage(1); // Reset to first page for new search
      setMode('people');
    } catch (error) {
      setPeople([]);
      setCurrentPage(1);
      setMode('people');
    } finally {
      setLoading(false);
    }
  };

  const handleViewActiveDmvRecord = async () => {
    if (!dmvRecordId || !dmvRecord) return;
    
    setLoading(true);
    try {
      // Search by the DMV record's person info
      const results = await searchPoliceRecords(dmvRecord.firstName || '', dmvRecord.lastName || '');
      setPeople(results);
      setCurrentPage(1); // Reset to first page for new search
      setMode('people');
    } catch (error) {
      setPeople([]);
      setCurrentPage(1);
      setMode('people');
    } finally {
      setLoading(false);
    }
  };

  const handlePersonSelect = (person: PersonWithPoliceRecords) => {
    setSelectedPerson(person);
    setMode('records');
  };

  const handleBackToSearch = () => {
    setMode('search');
    setPeople([]);
    setSelectedPerson(null);
    setFirstName('');
    setLastName('');
  };

  const handleBackToPeople = () => {
    setMode('people');
    setSelectedPerson(null);
  };

  const handleRecordSelect = (record: PoliceRecord) => {
    if (onSelectRecord) {
      onSelectRecord(record);
    }
  };

  const handleClose = () => {
    setMode('search');
    setPeople([]);
    setSelectedPerson(null);
    setFirstName('');
    setLastName('');
    setCurrentPage(1);
    onClose();
  };

  // Pagination logic
  const totalPages = Math.ceil(people.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPeople = people.slice(startIndex, endIndex);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  if (!open) return null;

  return (
    <DraggablePaper
      handleId="police-records-handle"
      modalId="policeRecords"
      PaperProps={{
        sx: {
          position: 'relative',
          overflow: 'visible',
          color: '#000',
          fontFamily: "'Courier New', Courier, monospace",
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          border: '1px solid #888',
          borderRadius: '4px',
          width: isSmallScreen ? '90vw' : 600,
          maxWidth: isSmallScreen ? '90vw' : 700,
          maxHeight: isSmallScreen ? '75vh' : '80vh',
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
            id="police-records-handle"
            sx={{ cursor: 'move', textAlign: 'center', pt: 1, pb: 1, position: 'relative' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 1, pl: 2 }}>
              {mode !== 'search' && (
                <IconButton
                  onClick={mode === 'people' ? handleBackToSearch : handleBackToPeople}
                  sx={{ color: '#000', p: 0.5 }}
                  size="small"
                >
                  <ArrowBackIcon />
                </IconButton>
              )}
              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem', color: '#000' }}>
                {mode === 'search' && 'Police Records'}
                {mode === 'people' && 'Search Results'}
                {mode === 'records' && `${selectedPerson?.FirstName} ${selectedPerson?.LastName}`}
              </Typography>
            </Box>
            <IconButton
              aria-label="close"
              onClick={handleClose}
              sx={{ position: 'absolute', right: 8, top: 4, color: '#000' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ position: 'relative', overflowY: 'auto', p: { xs: 1.5, sm: 2 }, pt: 0, flexGrow: 1, maxHeight: { xs: '60vh', sm: '70vh' } }}>
        {mode === 'search' && (
          <Box>
            
                {dmvRecord && (
                  <Box sx={{ 
                    p: 2, 
                    mb: 2, 
                    border: `1px solid ${borderColor}`, 
                    borderRadius: 1,
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Box>
                      <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#000', mb: 1 }}>
                        View Conviction For
                      </Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: '#000', opacity: 0.8 }}>
                        {dmvRecord.FirstName} {dmvRecord.LastName}
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleViewActiveDmvRecord()}
                      sx={{ 
                        fontSize: '0.7rem',
                        color: '#000',
                        borderColor: borderColor,
                        '&:hover': {
                          borderColor: '#000',
                          backgroundColor: 'rgba(0,0,0,0.05)'
                        }
                      }}
                    >
                      Quick Access
                    </Button>
                  </Box>
                )}

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  sx={{
                    '& .MuiInputLabel-root': { color: '#000' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(0,0,0,0.3)' },
                      '&:hover fieldset': { borderColor: 'rgba(0,0,0,0.5)' },
                      '& input': { color: '#000' }
                    }
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  sx={{
                    '& .MuiInputLabel-root': { color: '#000' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(0,0,0,0.3)' },
                      '&:hover fieldset': { borderColor: 'rgba(0,0,0,0.5)' },
                      '& input': { color: '#000' }
                    }
                  }}
                />
              </Grid>
            </Grid>

            <Button
              fullWidth
              variant="contained"
              onClick={handleSearch}
              disabled={loading || (!firstName.trim() && !lastName.trim())}
              sx={{
                backgroundColor: '#000',
                color: '#fff',
                '&:hover': { backgroundColor: '#333' },
                '&:disabled': { backgroundColor: '#ccc', color: '#666' }
              }}
            >
              {loading ? 'Searching...' : 'Search Records'}
            </Button>
          </Box>
        )}

        {mode === 'people' && (
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem', color: '#000' }}>
              Found {people.length} person{people.length !== 1 ? 's' : ''} with police records
            </Typography>
            
            {people.length === 0 ? (
              <Typography variant="body2" sx={{ textAlign: 'center', color: '#000', fontStyle: 'italic' }}>
                No people with police records found.
              </Typography>
            ) : (
              <Box>
                {currentPeople.map((person) => (
                  <Paper
                    key={person.PersonId}
                    onClick={() => handlePersonSelect(person)}
                    sx={{
                      p: 1.5, mb: 1, backgroundColor: 'rgba(255,255,255,0.7)', 
                      border: '1px solid rgba(0,0,0,0.3)', borderRadius: '4px',
                      cursor: 'pointer', 
                      '&:hover': { 
                        borderColor: 'rgba(0,0,0,0.6)', 
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1rem', color: '#000', mb: 0.25 }}>
                          {person.FirstName} {person.LastName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#000', opacity: 0.7, fontSize: '0.7rem' }}>
                          Click to view police records
                        </Typography>
                      </Box>
                      <Chip 
                        label={`${person.RecordCount} record${person.RecordCount !== 1 ? 's' : ''}`} 
                        size="small" 
                        sx={{ 
                          fontSize: '0.7rem', 
                          height: '20px', 
                          color: '#000', 
                          backgroundColor: 'rgba(0,0,0,0.1)',
                          fontWeight: 'bold'
                        }} 
                      />
                    </Box>
                    
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', 
                      gap: 1 
                    }}>
                      {person.Age && (
                        <Box>
                          <Typography variant="caption" sx={{ color: '#000', opacity: 0.6, fontSize: '0.7rem', fontWeight: 'bold' }}>
                            AGE
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#000', fontSize: '0.85rem', fontWeight: 500 }}>
                            {person.Age}
                          </Typography>
                        </Box>
                      )}
                      {person.Height && (
                        <Box>
                          <Typography variant="caption" sx={{ color: '#000', opacity: 0.6, fontSize: '0.7rem', fontWeight: 'bold' }}>
                            HEIGHT
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#000', fontSize: '0.85rem', fontWeight: 500 }}>
                            {person.Height}
                          </Typography>
                        </Box>
                      )}
                      {person.Weight && (
                        <Box>
                          <Typography variant="caption" sx={{ color: '#000', opacity: 0.6, fontSize: '0.7rem', fontWeight: 'bold' }}>
                            WEIGHT
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#000', fontSize: '0.85rem', fontWeight: 500 }}>
                            {person.Weight}
                          </Typography>
                        </Box>
                      )}
                      {person.EyeColor && (
                        <Box>
                          <Typography variant="caption" sx={{ color: '#000', opacity: 0.6, fontSize: '0.7rem', fontWeight: 'bold' }}>
                            EYES
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#000', fontSize: '0.85rem', fontWeight: 500 }}>
                            {person.EyeColor}
                          </Typography>
                        </Box>
                      )}
                      {person.HairColor && (
                        <Box>
                          <Typography variant="caption" sx={{ color: '#000', opacity: 0.6, fontSize: '0.7rem', fontWeight: 'bold' }}>
                            HAIR
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#000', fontSize: '0.85rem', fontWeight: 500 }}>
                            {person.HairColor}
                          </Typography>
                        </Box>
                      )}
                      {person.Sex && (
                        <Box>
                          <Typography variant="caption" sx={{ color: '#000', opacity: 0.6, fontSize: '0.7rem', fontWeight: 'bold' }}>
                            SEX
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#000', fontSize: '0.85rem', fontWeight: 500 }}>
                            {person.Sex}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Paper>
                ))}
                
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={handlePageChange}
                      size="small"
                      sx={{
                        '& .MuiPaginationItem-root': {
                          color: '#000',
                          fontSize: '0.8rem',
                        },
                        '& .Mui-selected': {
                          backgroundColor: 'rgba(0,0,0,0.2)',
                          color: '#000',
                        },
                      }}
                    />
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}

        {mode === 'records' && selectedPerson && (
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.85rem', color: '#000' }}>
              Police Records ({selectedPerson.Records.length})
            </Typography>
            
            {selectedPerson.Records.length === 0 ? (
              <Typography variant="body2" sx={{ textAlign: 'center', color: '#000', fontStyle: 'italic' }}>
                {selectedPerson.FirstName} {selectedPerson.LastName} does not have any prior convictions.
              </Typography>
            ) : (
              selectedPerson.Records.map((record) => (
                <Paper
                  key={record.Id}
                  onClick={() => handleRecordSelect(record)}
                  sx={{
                    p: 1, mb: 1, backgroundColor: 'transparent', border: '1px solid rgba(0,0,0,0.2)',
                    cursor: 'pointer', '&:hover': { borderColor: 'rgba(0,0,0,0.5)', backgroundColor: 'rgba(0,0,0,0.02)' }
                  }}
                >
                  <Grid container spacing={1}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem', color: '#000' }}>
                        <strong>Offense:</strong> {record.Offense}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem', color: '#000' }}>
                        <strong>Date:</strong> {formatDate(record.DateOfOffense)}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem', color: '#000' }}>
                        <strong>Outcome:</strong> {getOffenseOutcome(record.Offense)}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem', color: '#000' }}>
                        <strong>Case #:</strong> {record.PreviousCaseNumber}
                      </Typography>
                    </Grid>
                    {getSentence(record.Offense) && (
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem', color: '#000' }}>
                          <strong>Sentence:</strong> {getSentence(record.Offense)}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                  <Box sx={{ mt: 0.5, pt: 0.5, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                    <Typography variant="caption" sx={{ color: '#000', opacity: 0.7, fontStyle: 'italic', fontSize: '0.65rem' }}>
                      Click to add as evidence
                    </Typography>
                  </Box>
                </Paper>
              ))
            )}
          </Box>
        )}
            </Box>
          </Box>
        </div>
      </DraggablePaper>
  );
};

export default PoliceRecordsModal; 