import { Sun, Moon } from 'lucide-react';
import useThemeStore from '../../store/themeStore';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      style={{
        width: 36, height: 36, borderRadius: 'var(--radius)', border: '1px solid var(--border)',
        background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--foreground)', transition: 'all var(--transition)',
      }}
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
