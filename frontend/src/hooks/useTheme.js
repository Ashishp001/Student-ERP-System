import useThemeStore from '../store/themeStore';

export default function useTheme() {
  const { theme, setTheme, toggleTheme } = useThemeStore();
  return { theme, setTheme, toggleTheme, isDark: theme === 'dark' };
}
