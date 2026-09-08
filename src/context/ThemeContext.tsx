import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeId = 'tiranga' | 'navy' | 'emerald' | 'indigo' | 'dark' | 'heritage';

export interface ThemeOption {
  id: ThemeId;
  name: string;
  tagline: string;
  primaryColor: string;
  accentColor: string;
  bgColor: string;
  isDark?: boolean;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'tiranga',
    name: 'Indian Tricolor (तिरंगा)',
    tagline: 'Authentic Indian Flag palette — Kesari Saffron, Shweta White, Bharat Green & Ashoka Chakra Navy',
    primaryColor: '#0B192C',
    accentColor: '#FF671F',
    bgColor: '#FAFBFD',
  },
  {
    id: 'navy',
    name: 'Executive Navy & Slate',
    tagline: 'Modern, high-contrast GovTech command palette',
    primaryColor: '#0F172A',
    accentColor: '#2563EB',
    bgColor: '#F8FAFC',
  },
  {
    id: 'emerald',
    name: 'Civic Emerald & Forest',
    tagline: 'Fresh civic infrastructure & sustainable governance',
    primaryColor: '#064E3B',
    accentColor: '#059669',
    bgColor: '#F8FAF9',
  },
  {
    id: 'indigo',
    name: 'Royal Indigo & Slate',
    tagline: 'Sophisticated data science & analytical intelligence',
    primaryColor: '#1E1B4B',
    accentColor: '#4F46E5',
    bgColor: '#F8F9FE',
  },
  {
    id: 'dark',
    name: 'Obsidian Dark Command',
    tagline: 'Tactical dark mode for late-night audits and NOC displays',
    primaryColor: '#0B0F19',
    accentColor: '#38BDF8',
    bgColor: '#0B0F19',
    isDark: true,
  },
  {
    id: 'heritage',
    name: 'Heritage Parchment & Olive',
    tagline: 'Warm organic earth tones and classical archival parchment',
    primaryColor: '#1A2612',
    accentColor: '#606C38',
    bgColor: '#FDFBF7',
  },
];

interface ThemeContextType {
  currentTheme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  themeConfig: ThemeOption;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentThemeState] = useState<ThemeId>(() => {
    const saved = localStorage.getItem('mplads_interface_theme');
    if (saved && THEME_OPTIONS.some((t) => t.id === saved)) {
      return saved as ThemeId;
    }
    // Default to Indian Flag (Tiranga) theme
    return 'tiranga';
  });

  const setTheme = (theme: ThemeId) => {
    setCurrentThemeState(theme);
    localStorage.setItem('mplads_interface_theme', theme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [currentTheme]);

  const themeConfig = THEME_OPTIONS.find((t) => t.id === currentTheme) || THEME_OPTIONS[0];

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themeConfig }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
