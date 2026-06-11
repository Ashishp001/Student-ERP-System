/* shadcn/ui — ScrollArea primitive */
import { forwardRef } from 'react';

const ScrollArea = forwardRef(({ children, maxHeight = 400, style, ...props }, ref) => (
  <div
    ref={ref}
    style={{
      maxHeight, overflowY: 'auto', overflowX: 'hidden',
      scrollbarWidth: 'thin',
      scrollbarColor: 'var(--border) transparent',
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
));

ScrollArea.displayName = 'ScrollArea';
export { ScrollArea };
