import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'light',
      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light';
        document.documentElement.classList.toggle('dark', next === 'dark');
        set({ theme: next });
      },
      initTheme: () => {
        const t = get().theme;
        document.documentElement.classList.toggle('dark', t === 'dark');
      },
    }),
    { name: 'eduportal-theme' }
  )
);

export default useThemeStore;
