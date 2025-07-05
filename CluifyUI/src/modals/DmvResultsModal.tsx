import {
    DialogContent,
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
}

const DmvResultsModal: React.FC<DmvResultsModalProps> = ({ isOpen, onClose, results, darkMode }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    if (!isOpen) {
        return null;
    }

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
            centerOnMount
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: 'clamp(300px, 90vw, 1200px)',
                    maxHeight: '80vh',
                    overflow: 'hidden',
                    border: `1px solid ${borderColor}`,
                    borderRadius: '4px',
                    backgroundColor: contentBgColor,
                }}
            >
                <DialogTitle style={{ cursor: 'move', backgroundColor: titleBgColor, color: textColor, borderBottom: `1px solid ${borderColor}` }} id={handleId}>
                    <Typography sx={{ fontWeight: 'bold' }}>D.M.V. Search Results</Typography>
                    <IconButton
                        aria-label="close"
                        onClick={onClose}
                        sx={{ position: 'absolute', right: 8, top: 8, color: textColor }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <Box
                    sx={{
                        p: 2,
                        flexGrow: 1,
                        overflowY: 'auto',
                        minHeight: 0,
                    }}
                >
                    <DmvSearchResultsTable results={paginatedResults} darkMode={darkMode} />
                </Box>
                {results.length > 10 && (
                    <TablePagination
                        rowsPerPageOptions={[10, 25]}
                        component="div"
                        count={results.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        sx={{
                            flexShrink: 0,
                            borderTop: '1px solid',
                            borderColor: 'divider',
                            color: textColor,
                        }}
                    />
                )}
            </Box>
        </DraggablePaper>
    );
};

export default DmvResultsModal; 