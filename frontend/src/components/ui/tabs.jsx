/* shadcn/ui — Tabs primitive */
import { createContext, useContext, useState } from 'react';

const TabsContext = createContext({});

export function Tabs({ defaultValue, value, onValueChange, children, style, ...props }) {
  const [internal, setInternal] = useState(defaultValue || '');
  const active = value !== undefined ? value : internal;
  const setActive = onValueChange || setInternal;

  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div style={style} {...props}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, style, ...props }) {
  return (
    <div
      style={{
        display: 'inline-flex', gap: 2,
        background: 'var(--muted)', padding: 4,
        borderRadius: 'var(--radius)', ...style,
      }}
      {...props}
    >{children}</div>
  );
}

export function TabsTrigger({ value, children, style, ...props }) {
  const { active, setActive } = useContext(TabsContext);
  const isActive = active === value;

  return (
    <button
      onClick={() => setActive(value)}
      style={{
        padding: '6px 14px', borderRadius: 'calc(var(--radius) - 2px)',
        fontSize: '13px', fontWeight: isActive ? 600 : 500,
        border: 'none', cursor: 'pointer', transition: 'all var(--transition)',
        background: isActive ? 'var(--card)' : 'transparent',
        color: isActive ? 'var(--foreground)' : 'var(--muted-fg)',
        boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
        ...style,
      }}
      {...props}
    >{children}</button>
  );
}

export function TabsContent({ value, children, style, ...props }) {
  const { active } = useContext(TabsContext);
  if (active !== value) return null;
  return <div style={{ marginTop: 16, ...style }} {...props}>{children}</div>;
}
