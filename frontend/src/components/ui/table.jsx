/* shadcn/ui — Table primitives */
import { forwardRef } from 'react';

const Table = forwardRef(({ children, style, ...props }, ref) => (
  <div style={{ width: '100%', overflowX: 'auto' }}>
    <table ref={ref} style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', ...style }} {...props}>
      {children}
    </table>
  </div>
));
Table.displayName = 'Table';

const TableHeader = forwardRef(({ children, style, ...props }, ref) => (
  <thead ref={ref} style={{ borderBottom: '1px solid var(--border)', ...style }} {...props}>
    {children}
  </thead>
));
TableHeader.displayName = 'TableHeader';

const TableBody = forwardRef(({ children, style, ...props }, ref) => (
  <tbody ref={ref} style={{ ...style }} {...props}>
    {children}
  </tbody>
));
TableBody.displayName = 'TableBody';

const TableRow = forwardRef(({ children, style, ...props }, ref) => (
  <tr
    ref={ref}
    style={{ borderBottom: '1px solid var(--border)', transition: 'background var(--transition)', ...style }}
    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--muted)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
    {...props}
  >
    {children}
  </tr>
));
TableRow.displayName = 'TableRow';

const TableHead = forwardRef(({ children, style, ...props }, ref) => (
  <th
    ref={ref}
    style={{
      padding: '10px 16px', textAlign: 'left', fontWeight: 600,
      fontSize: '12px', color: 'var(--muted-fg)', textTransform: 'uppercase',
      letterSpacing: '0.05em', whiteSpace: 'nowrap', ...style,
    }}
    {...props}
  >
    {children}
  </th>
));
TableHead.displayName = 'TableHead';

const TableCell = forwardRef(({ children, style, ...props }, ref) => (
  <td ref={ref} style={{ padding: '10px 16px', color: 'var(--foreground)', ...style }} {...props}>
    {children}
  </td>
));
TableCell.displayName = 'TableCell';

const TableCaption = forwardRef(({ children, style, ...props }, ref) => (
  <caption ref={ref} style={{ padding: '10px', fontSize: '13px', color: 'var(--muted-fg)', ...style }} {...props}>
    {children}
  </caption>
));
TableCaption.displayName = 'TableCaption';

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption };
