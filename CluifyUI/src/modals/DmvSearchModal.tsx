import { useState, useEffect, ReactNode } from 'react';
import {
    DialogTitle, IconButton, Typography, Box, Select, MenuItem, Button, SelectChangeEvent, CircularProgress, TextField
} from '@mui/material';
import DraggablePaper from '../components/DraggablePaper';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { searchDmvRecords } from '../services/api';
import { DmvRecord } from '../types';
import DmvResultsModal from './DmvResultsModal';
import Snackbar from '@mui/material/Snackbar';
import Grid from '@mui/material/Grid';

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
        width: '100%',
        minHeight: { xs: '32px', sm: '36px' },
        gap: 1
    }}>
        <Box sx={{
            minWidth: { xs: '90px', sm: '110px' },
            pr: { sm: 2 },
            mr: { xs: 1, sm: 2 },
            flexShrink: 0
        }}>
            <Typography variant="body2" sx={{ fontWeight: 500, color: textColor }} noWrap>
                {label}
            </Typography>
        </Box>
        <Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', alignItems: 'center' }}>
            {children}
        </Box>
    </Box>
);

const DmvSearchModal: React.FC<DmvSearchModalProps> = ({ open, onClose, darkMode, currentReportId, onSelectDmvRecord }) => {
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

    if (!open || !currentReportId) return null;

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        if (name === 'licensePlate') {
            const raw = value.toUpperCase();
            let count = 0;
            let limited = '';
            for (const c of raw) {
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
        } catch {
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
    const textColor = darkMode ? '#fff' : '#000';
    const handleId = "dmv-search-handle";
    const inputBgColor = darkMode ? '#555' : '#f8f8f8';
    const borderColor = darkMode ? '#444' : '#ddd';
    const modalBgColor = darkMode ? '#222' : '#fff';

    const handleRowClick = (record: DmvRecord) => {
        onSelectDmvRecord(record);
        setSnackbar({ open: true, message: 'DMV Record added' });
    };

    const handleSnackbarClose = () => setSnackbar({ open: false, message: '' });

    const renderRangeSelect = (name: string, start: string, end: string, options: (string | number)[]) => {
        const isEndDisabled = !start;
        const startIndex = start ? options.indexOf(Number(start) || start) : -1;
        const endOptions = startIndex !== -1 ? options.slice(startIndex) : options;

        // Custom style to center text and hide arrow if value is present
        const selectSx = (hasValue: boolean) => ({
            borderRadius: 0,
            minWidth: { xs: '32px', sm: '40px' },
            maxWidth: { xs: '32px', sm: '40px' },
            backgroundColor: inputBgColor,
            color: textColor,
            height: { xs: '28px', sm: '32px' },
            fontSize: { xs: '0.82rem', sm: '0.92rem' },
            textAlign: 'center',
            '& .MuiOutlinedInput-root': {
                borderRadius: 0,
                height: { xs: '28px', sm: '32px' },
                fontSize: { xs: '0.82rem', sm: '0.92rem' },
                paddingLeft: 0,
                paddingRight: 0,
                backgroundColor: inputBgColor,
                color: textColor,
                '& fieldset': {
                    borderColor: borderColor,
                },
                '&:hover fieldset': {
                    borderColor: darkMode ? '#666' : '#999',
                },
                '&.Mui-focused fieldset': {
                    borderColor: darkMode ? '#888' : '#1976d2',
                },
            },
            '& .MuiSelect-select': {
                overflow: 'visible',
                paddingLeft: '.4rem',
                paddingRight: 0,
                color: textColor,
            },
            '& .MuiOutlinedInput-notchedOutline': { borderRadius: 0 },
            // Hide arrow if value is present
            '& .MuiSelect-icon': hasValue ? { display: 'none' } : { color: textColor },
        });

        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Select value={start} name={`${name}Start`} onChange={handleSelectChange} displayEmpty size="small" sx={selectSx(!!start)}>
                    {options.map(o => <MenuItem key={o} value={o} sx={{ backgroundColor: inputBgColor, color: textColor, '&:hover': { backgroundColor: darkMode ? '#666' : '#f0f0f0' } }}>{o}</MenuItem>)}
                </Select>
                <Typography sx={{ color: textColor }}>–</Typography>
                <Select value={end} name={`${name}End`} onChange={handleSelectChange} displayEmpty disabled={isEndDisabled} size="small" sx={selectSx(!!end)}>
                    {endOptions.map(o => <MenuItem key={o} value={o} sx={{ backgroundColor: inputBgColor, color: textColor, '&:hover': { backgroundColor: darkMode ? '#666' : '#f0f0f0' } }}>{o}</MenuItem>)}
                </Select>
            </Box>
        );
    };

    const renderSingleSelect = (name: string, value: string, options: string[]) => (
        <Select name={name} value={value} onChange={handleSelectChange} displayEmpty size="small" sx={{ 
            borderRadius: 0, 
            minWidth: { xs: '90px', sm: '110px' }, 
            maxWidth: { xs: '90px', sm: '110px' }, 
            backgroundColor: inputBgColor, 
            color: textColor, 
            height: { xs: '28px', sm: '32px' }, 
            fontSize: { xs: '0.9rem', sm: '1rem' }, 
            '& .MuiOutlinedInput-root': { 
                borderRadius: 0, 
                height: { xs: '28px', sm: '32px' }, 
                fontSize: { xs: '0.9rem', sm: '1rem' },
                backgroundColor: inputBgColor,
                color: textColor,
                '& fieldset': {
                    borderColor: borderColor,
                },
                '&:hover fieldset': {
                    borderColor: darkMode ? '#666' : '#999',
                },
                '&.Mui-focused fieldset': {
                    borderColor: darkMode ? '#888' : '#1976d2',
                },
            }, 
            '& .MuiOutlinedInput-notchedOutline': { borderRadius: 0 },
            '& .MuiSelect-select': {
                color: textColor,
            },
            '& .MuiSelect-icon': {
                color: textColor,
            },
        }}>
            <MenuItem value="" sx={{ backgroundColor: inputBgColor, color: textColor, '&:hover': { backgroundColor: darkMode ? '#666' : '#f0f0f0' } }}>—</MenuItem>
            {options.map(o => <MenuItem key={o} value={o} sx={{ backgroundColor: inputBgColor, color: textColor, '&:hover': { backgroundColor: darkMode ? '#666' : '#f0f0f0' } }}>{o}</MenuItem>)}
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
        <Box>
            <DraggablePaper 
                handleId={handleId} 
                modalId="dmvSearchModal"
                PaperProps={{
                    sx: {
                        backgroundColor: modalBgColor,
                    }
                }}
            >
                <div>
                    <DialogTitle sx={{ minHeight: 36, height: 36, paddingTop: 0, paddingBottom: 0, fontSize: '1rem', backgroundColor: titleBgColor, color: textColor, borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: 1, position: 'relative' }} id={handleId}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <SearchIcon fontSize='small' />
                            <Typography fontSize='1rem' fontWeight={600} sx={{ ml: 1 }}>D.M.V. Search</Typography>
                        </Box>
                        <IconButton aria-label="close" onClick={onClose} sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: textColor }}>
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>

                    <Box sx={{ flexGrow: 1, minHeight: 0, overflowY: 'auto', p: { xs: 2, sm: 3 }, maxHeight: { xs: '60vh', sm: 'none' }, backgroundColor: modalBgColor }}>
                        <Box sx={{ mx: 'auto', maxWidth: '350px' }}>
                            <FormField label="First Name:" textColor={textColor}>
                                <TextField 
                                    name="firstName" 
                                    value={searchQuery.firstName} 
                                    onChange={handleInputChange} 
                                    variant="outlined" 
                                    size="small" 
                                    fullWidth 
                                    placeholder="Enter first name" 
                                    sx={{ 
                                        borderRadius: 0, 
                                        '& .MuiOutlinedInput-root': { 
                                            borderRadius: 0, 
                                            height: { xs: '28px', sm: '32px' }, 
                                            fontSize: { xs: '0.9rem', sm: '1rem' },
                                            backgroundColor: inputBgColor,
                                            color: textColor,
                                            '& fieldset': {
                                                borderColor: borderColor,
                                            },
                                            '&:hover fieldset': {
                                                borderColor: darkMode ? '#666' : '#999',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: darkMode ? '#888' : '#1976d2',
                                            },
                                        }, 
                                        input: { 
                                            height: { xs: '28px', sm: '32px' }, 
                                            fontSize: { xs: '0.9rem', sm: '1rem' }, 
                                            padding: '0 8px',
                                            color: textColor,
                                            '&::placeholder': {
                                                color: darkMode ? '#aaa' : '#666',
                                                opacity: 1,
                                            },
                                        } 
                                    }} 
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
                                    placeholder="Enter last name" 
                                    sx={{ 
                                        borderRadius: 0, 
                                        '& .MuiOutlinedInput-root': { 
                                            borderRadius: 0, 
                                            height: { xs: '28px', sm: '32px' }, 
                                            fontSize: { xs: '0.9rem', sm: '1rem' },
                                            backgroundColor: inputBgColor,
                                            color: textColor,
                                            '& fieldset': {
                                                borderColor: borderColor,
                                            },
                                            '&:hover fieldset': {
                                                borderColor: darkMode ? '#666' : '#999',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: darkMode ? '#888' : '#1976d2',
                                            },
                                        }, 
                                        input: { 
                                            height: { xs: '28px', sm: '32px' }, 
                                            fontSize: { xs: '0.9rem', sm: '1rem' }, 
                                            padding: '0 8px',
                                            color: textColor,
                                            '&::placeholder': {
                                                color: darkMode ? '#aaa' : '#666',
                                                opacity: 1,
                                            },
                                        } 
                                    }} 
                                />
                            </FormField>
                            <Grid spacing={1} sx={{ mb: 1 }}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <FormField label="Age:" textColor={textColor}>{renderRangeSelect('age', searchQuery.ageStart, searchQuery.ageEnd, ageOptions)}</FormField>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <FormField label="Height:" textColor={textColor}>{renderRangeSelect('height', searchQuery.heightStart, searchQuery.heightEnd, heightOptions)}</FormField>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <FormField label="Weight:" textColor={textColor}>{renderRangeSelect('weight', searchQuery.weightStart, searchQuery.weightEnd, weightOptions)}</FormField>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <FormField label="Gender:" textColor={textColor}>{renderSingleSelect('gender', searchQuery.gender, ['Male', 'Female'])}</FormField>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <FormField label="Hair Color:" textColor={textColor}>{renderSingleSelect('hairColor', searchQuery.hairColor, ['Black', 'Brown', 'Blonde', 'Red', 'Gray', 'Bald', 'Other'])}</FormField>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <FormField label="Eye Color:" textColor={textColor}>{renderSingleSelect('eyeColor', searchQuery.eyeColor, ['Brown', 'Blue', 'Green', 'Hazel', 'Other'])}</FormField>
                                </Grid>
                            </Grid>
                            <FormField label="License Plate:" textColor={textColor}>
                                <TextField 
                                    name="licensePlate" 
                                    value={searchQuery.licensePlate} 
                                    onChange={handleInputChange} 
                                    variant="outlined" 
                                    size="small" 
                                    fullWidth 
                                    placeholder="Enter license plate" 
                                    inputProps={{ 
                                        maxLength: 12, 
                                        style: { textTransform: 'uppercase' } 
                                    }} 
                                    sx={{ 
                                        borderRadius: 0, 
                                        '& .MuiOutlinedInput-root': { 
                                            borderRadius: 0, 
                                            height: { xs: '28px', sm: '32px' }, 
                                            fontSize: { xs: '0.9rem', sm: '1rem' },
                                            backgroundColor: inputBgColor,
                                            color: textColor,
                                            '& fieldset': {
                                                borderColor: borderColor,
                                            },
                                            '&:hover fieldset': {
                                                borderColor: darkMode ? '#666' : '#999',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: darkMode ? '#888' : '#1976d2',
                                            },
                                        }, 
                                        input: { 
                                            height: { xs: '28px', sm: '32px' }, 
                                            fontSize: { xs: '0.9rem', sm: '1rem' }, 
                                            padding: '0 8px',
                                            color: textColor,
                                            '&::placeholder': {
                                                color: darkMode ? '#aaa' : '#666',
                                                opacity: 1,
                                            },
                                        } 
                                    }} 
                                />
                            </FormField>
                        </Box>
                    </Box>

                    <Box sx={{ p: { xs: 1, sm: 2 }, pt: 0.5, borderTop: `1px solid ${borderColor}`, minHeight: 40, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'stretch', borderRadius: 0 }}>
                        <Button fullWidth variant="contained" onClick={handleSearch} disabled={!isSearchable || isLoading} sx={{ borderRadius: 0 }}>
                            {isLoading ? <CircularProgress size={20} color="inherit" /> : 'SEARCH'}
                        </Button>
                        {error && <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>{error}</Typography>}
                    </Box>
                </div>
            </DraggablePaper>

            {isResultsModalOpen && results && (
                <DmvResultsModal isOpen={isResultsModalOpen} onClose={handleCloseResults} results={results} darkMode={darkMode} onRowClick={handleRowClick} />
            )}

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleSnackbarClose} message={snackbar.message} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} ContentProps={{ sx: { backgroundColor: darkMode ? '#333' : '#fff', color: darkMode ? '#fff' : '#000', fontWeight: 600 } }} />
        </Box>
    );
};

export default DmvSearchModal;
