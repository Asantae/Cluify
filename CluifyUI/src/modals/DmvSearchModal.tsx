import { useState, useEffect, ReactNode } from 'react';
import {
    DialogContent, DialogTitle, IconButton, Typography, Box, Select, MenuItem, Button, SelectChangeEvent, CircularProgress
} from '@mui/material';
import DraggablePaper from '../components/DraggablePaper';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { searchDmvRecords } from '../services/api';
import { DmvRecord } from '../types';
import DmvResultsModal from './DmvResultsModal';

interface DmvSearchModalProps {
    open: boolean;
    onClose: () => void;
    darkMode: boolean;
}

interface FormFieldProps {
    label: string;
    children: ReactNode;
    textColor: string;
}

const FormField = ({ label, children, textColor }: FormFieldProps) => (
    <Box sx={{
        display: { xs: 'block', sm: 'flex' },
        alignItems: 'center',
        mb: 2,
    }}>
        <Box sx={{
            minWidth: { sm: '80px' },
            pr: { sm: 2 },
        }}>
            <Typography variant="body1" sx={{ fontWeight: 500, color: textColor }}>{label}</Typography>
        </Box>
        <Box>
            {children}
        </Box>
    </Box>
);

const DmvSearchModal: React.FC<DmvSearchModalProps> = ({ open, onClose, darkMode }) => {
    const [searchQuery, setSearchQuery] = useState({
        ageStart: '', ageEnd: '',
        heightStart: '', heightEnd: '',
        weightStart: '', weightEnd: '',
        gender: '',
        hairColor: '',
        eyeColor: '',
    });
    const [isSearchable, setIsSearchable] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<DmvRecord[] | null>(null);
    const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);

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


    const renderRangeSelect = (name: string, start: string, end: string, options: (string | number)[]) => {
        const isEndDisabled = !start;
        const startIndex = start ? options.indexOf(Number(start) || start) : -1;
        const endOptions = startIndex !== -1 ? options.slice(startIndex) : options;

        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Select value={start} name={`${name}Start`} onChange={handleSelectChange} displayEmpty sx={{ minWidth: '70px', backgroundColor: inputBgColor, color: textColor, '.MuiSelect-icon': { color: textColor } }}>
                    <MenuItem value="">—</MenuItem>
                    {options.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                </Select>
                <Typography sx={{ color: textColor }}>–</Typography>
                <Select value={end} name={`${name}End`} onChange={handleSelectChange} displayEmpty disabled={isEndDisabled} sx={{ minWidth: '70px', backgroundColor: inputBgColor, color: textColor, '.MuiSelect-icon': { color: textColor } }}>
                    <MenuItem value="">—</MenuItem>
                    {endOptions.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                </Select>
            </Box>
        );
    };

    const renderSingleSelect = (name: string, value: string, options: string[]) => (
        <Select name={name} value={value} onChange={handleSelectChange} displayEmpty sx={{ minWidth: '148px', backgroundColor: inputBgColor, color: textColor, '.MuiSelect-icon': { color: textColor } }}>
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

    if (!open) return null;

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
                    <DialogTitle style={{ cursor: 'move', backgroundColor: titleBgColor, color: textColor, borderBottom: `1px solid ${borderColor}` }} id={handleId}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <SearchIcon />
                            <Typography component="span" sx={{ fontWeight: 'bold' }}>D.M.V. Search</Typography>
                        </Box>
                        <IconButton aria-label="close" onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8, color: textColor }}>
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <Box sx={{ flexGrow: 1, minHeight: 0, overflowY: 'auto', p: { xs: 2, sm: 3 } }}>
                        <Box sx={{ mx: 'auto', maxWidth: '350px' }}>
                            <FormField label="Age:" textColor={textColor}>{renderRangeSelect('age', searchQuery.ageStart, searchQuery.ageEnd, ageOptions)}</FormField>
                            <FormField label="Height:" textColor={textColor}>{renderRangeSelect('height', searchQuery.heightStart, searchQuery.heightEnd, heightOptions)}</FormField>
                            <FormField label="Weight:" textColor={textColor}>{renderRangeSelect('weight', searchQuery.weightStart, searchQuery.weightEnd, weightOptions)}</FormField>
                            <FormField label="Gender:" textColor={textColor}>{renderSingleSelect('gender', searchQuery.gender, ['Male', 'Female'])}</FormField>
                            <FormField label="Hair Color:" textColor={textColor}>{renderSingleSelect('hairColor', searchQuery.hairColor, ['Black', 'Brown', 'Blonde', 'Red', 'Gray', 'Bald', 'Other'])}</FormField>
                            <FormField label="Eye Color:" textColor={textColor}>{renderSingleSelect('eyeColor', searchQuery.eyeColor, ['Brown', 'Blue', 'Green', 'Hazel', 'Other'])}</FormField>
                        </Box>
                    </Box>
                    <Box sx={{ p: { xs: 2, sm: 3 }, pt: 2, borderTop: `1px solid ${borderColor}` }}>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleSearch}
                            disabled={!isSearchable || isLoading}
                            sx={{
                                py: 1.5,
                                fontWeight: 'bold',
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
                />
            )}
        </>
    );
};

export default DmvSearchModal;