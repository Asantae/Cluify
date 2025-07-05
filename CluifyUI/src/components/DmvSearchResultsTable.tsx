import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { DmvRecord } from '../types';

interface DmvSearchResultsTableProps {
  results: DmvRecord[];
  darkMode: boolean;
}

const DmvSearchResultsTable = ({ results, darkMode }: DmvSearchResultsTableProps) => {
  const tableHeaderBgColor = darkMode ? '#444' : '#f8f8f8';
  const textColor = darkMode ? '#fff' : '#000';
  const tableBorderColor = darkMode ? '#555' : '#ddd';

  return (
    <TableContainer component={Paper} sx={{ flexGrow: 1, overflow: 'auto', backgroundColor: 'transparent', boxShadow: 'none' }}>
      <Table stickyHeader aria-label="dmv results table" size="small">
        <TableHead>
          <TableRow sx={{ '& .MuiTableCell-root': { backgroundColor: tableHeaderBgColor, color: textColor, fontWeight: 'bold', borderBottom: `2px solid ${tableBorderColor}` } }}>
            <TableCell sx={{ width: '25%' }}>Name</TableCell>
            <TableCell align="right" sx={{ width: '10%' }}>Age</TableCell>
            <TableCell align="right" sx={{ width: '10%' }}>Sex</TableCell>
            <TableCell align="right" sx={{ width: '10%' }}>Height</TableCell>
            <TableCell align="right" sx={{ width: '10%' }}>Weight</TableCell>
            <TableCell sx={{ width: '10%' }}>Hair</TableCell>
            <TableCell sx={{ width: '10%' }}>Eyes</TableCell>
            <TableCell sx={{ width: '15%' }}>License #</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {results.map((row) => (
            <TableRow key={row.licenseNumber} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '& .MuiTableCell-root': { color: textColor, borderBottom: `1px solid ${tableBorderColor}` } }}>
              <TableCell component="th" scope="row">{row.firstName} {row.lastName}</TableCell>
              <TableCell align="right">{row.age}</TableCell>
              <TableCell align="right">{row.sex}</TableCell>
              <TableCell align="right">{row.height}</TableCell>
              <TableCell align="right">{row.weight}</TableCell>
              <TableCell>{row.hairColor}</TableCell>
              <TableCell>{row.eyeColor}</TableCell>
              <TableCell>{row.licenseNumber}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DmvSearchResultsTable; 