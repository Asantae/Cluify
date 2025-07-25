// If you haven't already, run: npm install @tanstack/react-table
import { useReactTable, getCoreRowModel, flexRender, ColumnDef, HeaderGroup, Row } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, useTheme } from '@mui/material';
import { DmvRecord } from '../types';

interface DmvSearchResultsTableProps {
  results: DmvRecord[];
  darkMode: boolean;
  onRowClick: (record: DmvRecord) => void;
  selectedRecordId?: string;
}

const columns: ColumnDef<DmvRecord, any>[] = [
  { accessorKey: 'name', header: 'Name', cell: (info: any) => `${info.row.original.firstName} ${info.row.original.lastName}`, meta: { width: '20%' } },
  { accessorKey: 'age', header: 'Age', cell: (info: any) => info.row.original.age, meta: { align: 'right', width: '8%' } },
  { accessorKey: 'sex', header: 'Sex', cell: (info: any) => info.row.original.sex, meta: { align: 'right', width: '8%' } },
  { accessorKey: 'height', header: 'Height', cell: (info: any) => info.row.original.height, meta: { align: 'right', width: '12%' } },
  { accessorKey: 'weight', header: 'Weight', cell: (info: any) => info.row.original.weight, meta: { align: 'right', width: '12%' } },
  { accessorKey: 'hairColor', header: 'Hair', cell: (info: any) => info.row.original.hairColor, meta: { width: '12%' } },
  { accessorKey: 'eyeColor', header: 'Eyes', cell: (info: any) => info.row.original.eyeColor, meta: { width: '12%' } },
  { accessorKey: 'licensePlate', header: 'License Plate', cell: (info: any) => info.row.original.licensePlate, meta: { width: '16%' } },
];

const DmvSearchResultsTable = ({ results, darkMode, onRowClick }: DmvSearchResultsTableProps) => {
  const table = useReactTable<DmvRecord>({
    data: results,
    columns,
    getCoreRowModel: getCoreRowModel(),
    debugTable: false,
  });

  const theme = useTheme();

  const tableHeaderBgColor = darkMode ? '#444' : '#f8f8f8';
  const textColor = darkMode ? '#fff' : '#000';
  const tableBorderColor = darkMode ? '#555' : '#ddd';
  const rowHoverColor = darkMode ? '#333' : '#f0f0f0';

  return (
    <TableContainer component={Paper} sx={{ 
      flexGrow: 1, 
      overflow: 'hidden', 
      backgroundColor: 'transparent', 
      boxShadow: 'none',
      minWidth: '600px' // Reduced minimum width for better responsiveness
    }}>
      <Table stickyHeader aria-label="dmv results table" size="small">
        <TableHead>
          {table.getHeaderGroups().map((headerGroup: HeaderGroup<DmvRecord>) => (
            <TableRow key={headerGroup.id} sx={{ '& .MuiTableCell-root': { backgroundColor: tableHeaderBgColor, color: textColor, fontWeight: 'bold', borderBottom: `2px solid ${tableBorderColor}` } }}>
              {headerGroup.headers.map((header: any) => (
                <TableCell
                  key={header.id}
                  align={header.column.columnDef.meta?.align || 'left'}
                  sx={{ width: header.column.columnDef.meta?.width }}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {table.getRowModel().rows.map((row: Row<DmvRecord>, idx: number) => {
            const darkRowColor = darkMode ? '#222' : theme.palette.action.selected;
            return (
              <TableRow
                key={row.id}
                sx={{
                  cursor: 'pointer',
                  backgroundColor: idx % 2 === 0 ? darkRowColor : undefined,
                  '&:hover': { backgroundColor: rowHoverColor },
                  '& .MuiTableCell-root': { color: textColor, borderBottom: 'none' },
                }}
                onClick={() => onRowClick(row.original)}
              >
                {row.getVisibleCells().map((cell: any) => (
                  <TableCell key={cell.id} align={cell.column.columnDef.meta?.align || 'left'}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DmvSearchResultsTable; 