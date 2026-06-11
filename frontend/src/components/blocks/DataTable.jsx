import { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';

/**
 * DataTable — reusable TanStack Table wrapper per PRD 9.1
 * Props:
 *   columns   — TanStack column definitions
 *   data      — array of row data
 *   search    — bool: show search input
 *   pageSize  — default rows per page (default 10)
 *   exportCsv — bool|string: enable CSV export (string = custom filename)
 */
export default function DataTable({ columns, data = [], search = true, pageSize = 10, exportCsv = false }) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize });

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, pagination },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const rows = table.getRowModel().rows;
  const { pageIndex } = table.getState().pagination;
  const pageCount = table.getPageCount();

  /** Export filtered rows to CSV */
  const handleExportCsv = () => {
    const filteredRows = table.getFilteredRowModel().rows;
    const headers = columns
      .filter((c) => c.accessorKey || c.accessorFn)
      .map((c) => ({ key: c.accessorKey || c.id, label: typeof c.header === 'string' ? c.header : (c.accessorKey || c.id) }));

    const csvRows = [
      headers.map((h) => `"${h.label}"`).join(','),
      ...filteredRows.map((row) =>
        headers.map((h) => {
          const val = row.getValue(h.key);
          const str = val != null ? String(val).replace(/"/g, '""') : '';
          return `"${str}"`;
        }).join(',')
      ),
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (typeof exportCsv === 'string' ? exportCsv : 'export') + '.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Toolbar: Search + Export */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {search && (
          <div style={{ position: 'relative', maxWidth: 320, flex: 1 }}>
            <Search size={14} style={{
              position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--muted-fg)', pointerEvents: 'none',
            }} />
            <input
              value={globalFilter}
              onChange={e => { setGlobalFilter(e.target.value); setPagination(p => ({ ...p, pageIndex: 0 })); }}
              placeholder="Search…"
              style={{
                width: '100%', padding: '7px 10px 7px 32px',
                border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                background: 'var(--background)', color: 'var(--foreground)',
                fontSize: 13, outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
        )}
        {exportCsv && (
          <button
            onClick={handleExportCsv}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '6px 14px', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', background: 'var(--card)',
              color: 'var(--foreground)', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', transition: 'background var(--transition)',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--muted)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--card)'; }}
          >
            <Download size={13} /> Export CSV
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id} style={{ background: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                {hg.headers.map(header => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{
                      padding: '10px 14px', textAlign: 'left', fontWeight: 600,
                      color: 'var(--muted-fg)', fontSize: 12, textTransform: 'uppercase',
                      letterSpacing: '0.05em', whiteSpace: 'nowrap',
                      cursor: header.column.getCanSort() ? 'pointer' : 'default',
                      userSelect: 'none',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        header.column.getIsSorted() === 'asc' ? <ChevronUp size={12} /> :
                        header.column.getIsSorted() === 'desc' ? <ChevronDown size={12} /> :
                        <ChevronsUpDown size={12} style={{ opacity: 0.4 }} />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{
                  padding: '40px 20px', textAlign: 'center',
                  color: 'var(--muted-fg)', fontSize: 14,
                }}>
                  No results found
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr
                  key={row.id}
                  style={{
                    borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none',
                    background: 'var(--card)',
                    transition: 'background 150ms',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--muted)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--card)')}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} style={{ padding: '10px 14px', verticalAlign: 'middle' }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontSize: 12, color: 'var(--muted-fg)', flexWrap: 'wrap', gap: 8,
        }}>
          <span>
            Page {pageIndex + 1} of {pageCount} &nbsp;·&nbsp; {data.length} total rows
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              style={pagerBtn}
            ><ChevronLeft size={14} /></button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              style={pagerBtn}
            ><ChevronRight size={14} /></button>
          </div>
        </div>
      )}
    </div>
  );
}

const pagerBtn = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  padding: '4px 8px', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
  background: 'var(--card)', color: 'var(--foreground)', cursor: 'pointer',
  fontSize: 13,
};
