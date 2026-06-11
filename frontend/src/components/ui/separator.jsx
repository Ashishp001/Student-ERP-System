/* shadcn/ui — Separator primitive */
import { forwardRef } from 'react';

const Separator = forwardRef(({ orientation = 'horizontal', style, ...props }, ref) => {
  const isVertical = orientation === 'vertical';

  return (
    <div
      ref={ref}
      role="separator"
      aria-orientation={orientation}
      style={{
        flexShrink: 0,
        background: 'var(--border)',
        ...(isVertical
          ? { width: '1px', height: '100%', margin: '0 8px' }
          : { height: '1px', width: '100%', margin: '8px 0' }),
        ...style,
      }}
      {...props}
    />
  );
});

Separator.displayName = 'Separator';
export { Separator };
