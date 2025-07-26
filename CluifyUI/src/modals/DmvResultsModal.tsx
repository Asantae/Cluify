import {
    DialogTitle,
    IconButton,
    Typography,
    Box,
    TablePagination,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DraggablePaper from '../components/DraggablePaper';
import { DmvRecord } from '../types';
import DmvSearchResultsTable from '../components/DmvSearchResultsTable';
import React, { useState } from 'react';

interface DmvResultsModalProps {
    isOpen: boolean;
    onClose: () => void;
    results: DmvRecord[];
    darkMode: boolean;
    onRowClick?: (record: DmvRecord) => void;
}

const DmvResultsModal: React.FC<DmvResultsModalProps> = ({ isOpen, onClose, results, darkMode, onRowClick }) => {
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
    const handleId = "dmv-results-modal-handle";

    const titleBgColor = darkMode ? '#333' : '#f0f0f0';
    const contentBgColor = darkMode ? '#222' : '#fff';
    const textColor = darkMode ? '#fff' : '#000';
    const borderColor = darkMode ? '#444' : '#ddd';

    return (
        <DraggablePaper 
            modalId="dmvResults" 
            handleId={handleId} 
            PaperProps={{
                sx: {
                    width: { xs: '95vw', sm: '90vw', md: '80vw', lg: '70vw' },
                    maxWidth: '1200px',
                    height: { xs: '80vh', sm: '75vh' },
                    maxHeight: '800px'
                }
            }}
        >
                <DialogTitle style={{ cursor: 'move', backgroundColor: titleBgColor, color: textColor, borderBottom: `1px solid ${borderColor}` }} id={handleId}>
                    <Typography sx={{ fontWeight: 'bold' }}>{results.length} Results</Typography>
                    <IconButton aria-label="close" onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8, color: textColor }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <Box sx={{ p: 2, flexGrow: 1, minHeight: 0 }}>
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
                        Click a name to add a suspect
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
                        <DmvSearchResultsTable results={paginatedResults} darkMode={darkMode} onRowClick={onRowClick || (() => {})} />
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

export default DmvResultsModal;
