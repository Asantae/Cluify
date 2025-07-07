import { useState, useEffect, ReactNode } from 'react';
import {
    DialogContent, DialogTitle, IconButton, Typography, Box, Select, MenuItem, Button, SelectChangeEvent, CircularProgress, TextField, Paper
} from '@mui/material';
import DraggablePaper from '../components/DraggablePaper';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { searchDmvRecords } from '../services/api';
import { DmvRecord } from '../types';
import DmvResultsModal from './DmvResultsModal';
import DmvSearchResultsTable from '../components/DmvSearchResultsTable';
import Snackbar from '@mui/material/Snackbar';

interface DmvSearchModalProps {
    open: boolean;
    onClose: () => void;
    darkMode: boolean;
    currentReportId: string;
    onSelectDmvRecord: (record: DmvRecord) => void;
}

interface FormFieldProps {
    label: string;
    children: ReactNode;
    textColor: string;
}

const FormField = ({ label, children, textColor }: FormFieldProps) => (
    <Box sx={{
        display: 'flex',
        alignItems: 'center',
        mb: 2,
        justifyContent: 'space-between',
        width: '100%'
    }}>
        <Box sx={{
            minWidth: { sm: '80px' },
            pr: { sm: 2 },
            mr: { xs: 1, sm: 2 }
        }}>
            <Typography variant="body2" sx={{ fontWeight: 500, color: textColor }}>{label}</Typography>
        </Box>
        <Box>
            {children}
        </Box>
    </Box>
);

const DmvSearchModal: React.FC<DmvSearchModalProps> = ({ open, onClose, darkMode, currentReportId, onSelectDmvRecord }) => {
    if (!open || !currentReportId) return null;
    const [searchQuery, setSearchQuery] = useState({
        ageStart: '', ageEnd: '',
        heightStart: '', heightEnd: '',
        weightStart: '', weightEnd: '',
        gender: '',
        hairColor: '',
        eyeColor: '',
        firstName: '',
        lastName: '',
        licensePlate: '',
    });
    const [isSearchable, setIsSearchable] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<DmvRecord[] | null>(null);
    const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

    useEffect(() => {
        const isAnyFieldFilled = Object.values(searchQuery).some(value => value !== '');
        setIsSearchable(isAnyFieldFilled);
    }, [searchQuery]);

    const handleSelectChange = (event: SelectChangeEvent<string>) => {
        const { name, value } = event.target;
        setSearchQuery(prev => {
            const newQuery = { ...prev, [name]: value };
            if (name.endsWith('Start')) {
                const baseName = name.replace('Start', '');
                const endFieldName = `${baseName}End`;
                newQuery[endFieldName as keyof typeof newQuery] = '';
            }
            return newQuery;
        });
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        if (name === 'licensePlate') {
            // Allow spaces and dashes, but only up to 8 non-space/dash characters
            let raw = value.toUpperCase();
            let count = 0;
            let limited = '';
            for (let c of raw) {
                if (c !== ' ' && c !== '-') count++;
                if (count > 8) break;
                limited += c;
            }
            setSearchQuery(prev => ({ ...prev, [name]: limited }));
        } else {
            setSearchQuery(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSearch = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const queryToSubmit = Object.fromEntries(
                Object.entries(searchQuery).filter(([, value]) => value !== '')
            );
            const searchResults = await searchDmvRecords(queryToSubmit);
            setResults(searchResults);
            setIsResultsModalOpen(true);
        } catch (err) {
            setError('Failed to perform search. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseResults = () => {
        setIsResultsModalOpen(false);
        setResults(null);
    };

    const titleBgColor = darkMode ? '#333' : '#f0f0f0';
    const contentBgColor = darkMode ? '#222' : '#fff';
    const textColor = darkMode ? '#fff' : '#000';
    const handleId = "dmv-search-handle";
    const inputBgColor = darkMode ? '#444' : '#f8f8f8';
    const borderColor = darkMode ? '#444' : '#ddd';

    const handleRowClick = (record: DmvRecord) => {
        onSelectDmvRecord(record);
        setSnackbar({ open: true, message: 'DMV Record added' });
    };

    const handleSnackbarClose = () => setSnackbar({ open: false, message: '' });

    const renderRangeSelect = (name: string, start: string, end: string, options: (string | number)[]) => {
        const isEndDisabled = !start;
        const startIndex = start ? options.indexOf(Number(start) || start) : -1;
        const endOptions = startIndex !== -1 ? options.slice(startIndex) : options;

        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Select value={start} name={`${name}Start`} onChange={handleSelectChange} displayEmpty sx={{ borderRadius: 0, minWidth: { xs: '47px', sm: '56px' }, maxWidth: { xs: '47px', sm: '56px' }, backgroundColor: inputBgColor, color: textColor, '.MuiSelect-icon': { color: textColor }, '& .MuiInputBase-root': { borderRadius: 0, height: { xs: 28, sm: 32 }, fontSize: '0.95rem' }, '& .MuiSelect-select': { borderRadius: 0, height: { xs: 28, sm: 32 }, padding: '0 8px', fontSize: '0.95rem', display: 'flex', alignItems: 'center' } }}>
                    <MenuItem value="">—</MenuItem>
                    {options.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                </Select>
                <Typography sx={{ color: textColor }}>–</Typography>
                <Select value={end} name={`${name}End`} onChange={handleSelectChange} displayEmpty disabled={isEndDisabled} sx={{ borderRadius: 0, minWidth: { xs: '47px', sm: '56px' }, maxWidth: { xs: '47px', sm: '56px' }, backgroundColor: inputBgColor, color: textColor, '.MuiSelect-icon': { color: textColor }, '& .MuiInputBase-root': { borderRadius: 0, height: { xs: 28, sm: 32 }, fontSize: '0.95rem' }, '& .MuiSelect-select': { borderRadius: 0, height: { xs: 28, sm: 32 }, padding: '0 8px', fontSize: '0.95rem', display: 'flex', alignItems: 'center' } }}>
                    <MenuItem value="">—</MenuItem>
                    {endOptions.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                </Select>
            </Box>
        );
    };

    const renderSingleSelect = (name: string, value: string, options: string[]) => (
        <Select name={name} value={value} onChange={handleSelectChange} displayEmpty sx={{ borderRadius: 0, minWidth: { xs: '120px', sm: '148px' }, maxWidth: { xs: '120px', sm: '148px' }, backgroundColor: inputBgColor, color: textColor, '.MuiSelect-icon': { color: textColor }, '& .MuiInputBase-root': { borderRadius: 0, height: { xs: 28, sm: 32 }, fontSize: '0.95rem' }, '& .MuiSelect-select': { borderRadius: 0, height: { xs: 28, sm: 32 }, padding: '0 8px', fontSize: '0.95rem', display: 'flex', alignItems: 'center' } }}>
            <MenuItem value="">—</MenuItem>
            {options.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
        </Select>
    );

    const ageOptions = Array.from({ length: 83 }, (_, i) => i + 18);
    const weightOptions = Array.from({ length: 43 }, (_, i) => 90 + (i * 5));
    const heightOptions: string[] = Array.from({ length: 37 }, (_, i) => {
        const feet = Math.floor((48 + i) / 12);
        const inches = (48 + i) % 12;
        return `${feet}'${inches}"`;
    });

    return (
        <>
            <DraggablePaper handleId={handleId} centerOnMount modalId="dmvSearchModal">
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    maxHeight: '90vh', 
                    overflow: 'hidden', 
                    width: { xs: '280', sm: 300 },
                    maxWidth: { xs: 320, sm: 350 },
                    backgroundColor: contentBgColor, 
                    border: `1px solid ${borderColor}`, 
                    borderRadius: '4px' 
                }}>
                    <DialogTitle sx={{ minHeight: 36, height: 36, paddingTop: 0, paddingBottom: 0, fontSize: '1rem', backgroundColor: titleBgColor, color: textColor, borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: 1, position: 'relative' }} id={handleId}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <SearchIcon fontSize='small' />
                            <Typography fontSize='1rem' fontWeight={600} sx={{ ml: 1 }}>D.M.V. Search</Typography>
                        </Box>
                        <IconButton aria-label="close" onClick={onClose} sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: textColor }}>
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <Box sx={{ flexGrow: 1, minHeight: 0, overflowY: 'auto', p: { xs: 2, sm: 3 } }}>
                        <Box sx={{ mx: 'auto', maxWidth: '350px' }}>
                            <FormField label="First Name:" textColor={textColor}>
                                <TextField
                                    name="firstName"
                                    value={searchQuery.firstName}
                                    onChange={handleInputChange}
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    sx={{ borderRadius: 0, minWidth: { xs: '120px', sm: '148px' }, maxWidth: { xs: '120px', sm: '148px' }, backgroundColor: inputBgColor, '& .MuiInputBase-root': { borderRadius: 0, height: { xs: 28, sm: 32 }, fontSize: '0.95rem' }, '& .MuiInputBase-input': { height: { xs: 28, sm: 32 }, padding: '0 8px', fontSize: '0.95rem' } }}
                                    placeholder="Enter first name"
                                />
                            </FormField>
                            <FormField label="Last Name:" textColor={textColor}>
                                <TextField
                                    name="lastName"
                                    value={searchQuery.lastName}
                                    onChange={handleInputChange}
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    sx={{ borderRadius: 0, minWidth: { xs: '120px', sm: '148px' }, maxWidth: { xs: '120px', sm: '148px' }, backgroundColor: inputBgColor, '& .MuiInputBase-root': { borderRadius: 0, height: { xs: 28, sm: 32 }, fontSize: '0.95rem' }, '& .MuiInputBase-input': { height: { xs: 28, sm: 32 }, padding: '0 8px', fontSize: '0.95rem' } }}
                                    placeholder="Enter last name"
                                />
                            </FormField>
                            <FormField label="Age:" textColor={textColor}>{renderRangeSelect('age', searchQuery.ageStart, searchQuery.ageEnd, ageOptions)}</FormField>
                            <FormField label="Height:" textColor={textColor}>{renderRangeSelect('height', searchQuery.heightStart, searchQuery.heightEnd, heightOptions)}</FormField>
                            <FormField label="Weight:" textColor={textColor}>{renderRangeSelect('weight', searchQuery.weightStart, searchQuery.weightEnd, weightOptions)}</FormField>
                            <FormField label="Gender:" textColor={textColor}>{renderSingleSelect('gender', searchQuery.gender, ['Male', 'Female'])}</FormField>
                            <FormField label="Hair Color:" textColor={textColor}>{renderSingleSelect('hairColor', searchQuery.hairColor, ['Black', 'Brown', 'Blonde', 'Red', 'Gray', 'Bald', 'Other'])}</FormField>
                            <FormField label="Eye Color:" textColor={textColor}>{renderSingleSelect('eyeColor', searchQuery.eyeColor, ['Brown', 'Blue', 'Green', 'Hazel', 'Other'])}</FormField>
                            <FormField label="License Plate:" textColor={textColor}>
                                <TextField
                                    name="licensePlate"
                                    value={searchQuery.licensePlate}
                                    onChange={handleInputChange}
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    sx={{ borderRadius: 0, minWidth: { xs: '120px', sm: '148px' }, maxWidth: { xs: '120px', sm: '148px' }, backgroundColor: inputBgColor, '& .MuiInputBase-root': { borderRadius: 0, height: { xs: 28, sm: 32 }, fontSize: '0.95rem' }, '& .MuiInputBase-input': { height: { xs: 28, sm: 32 }, padding: '0 8px', fontSize: '0.95rem' } }}
                                    placeholder="Enter license plate"
                                    inputProps={{ maxLength: 12, style: { textTransform: 'uppercase' } }}
                                />
                            </FormField>
                        </Box>
                    </Box>
                    <Box sx={{ p: { xs: 1, sm: 2 }, pt: 1, borderTop: `1px solid ${borderColor}`, minHeight: 48, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'stretch' }}>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleSearch}
                            disabled={!isSearchable || isLoading}
                            sx={{
                                height: 28,
                                fontSize: '0.95rem',
                                py: 0,
                                minHeight: 28,
                                backgroundColor: '#007bff',
                                color: '#fff',
                                '&:hover': {
                                    backgroundColor: '#0056b3',
                                },
                                '&.Mui-disabled': {
                                    backgroundColor: darkMode ? '#555' : '#ccc',
                                    color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.87)',
                                },
                                position: 'relative',
                            }}
                        >
                            {isLoading ? <CircularProgress size={24} color="inherit" sx={{ position: 'absolute' }} /> : 'SEARCH'}
                        </Button>
                        {error && <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>{error}</Typography>}
                    </Box>
                </Box>
            </DraggablePaper>
            {isResultsModalOpen && results && (
                <DmvResultsModal
                    isOpen={isResultsModalOpen}
                    onClose={handleCloseResults}
                    results={results}
                    darkMode={darkMode}
                    onRowClick={handleRowClick}
                />
            )}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                message={snackbar.message}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                ContentProps={{ sx: { backgroundColor: darkMode ? '#333' : '#fff', color: darkMode ? '#fff' : '#000', fontWeight: 600 } }}
            />
        </>
    );
};

export default DmvSearchModal;