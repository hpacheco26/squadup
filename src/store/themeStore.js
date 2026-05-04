import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
    persist(
        (set) => ({
            darkMode: false,
            toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
        }),
        { name: 'squadup-theme' }
    )
);

export default useThemeStore;
