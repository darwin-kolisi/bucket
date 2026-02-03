'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const Context = createContext();

export function useAppContext() {
  const context = useContext(Context);
  if (!context) {
    throw new Error('useProvider must be used within Provider');
  }
  return context;
}

export function Provider({ children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [projectsView, setProjectsView] = useState('board');
  const [theme, setTheme] = useState('system');
  const [resolvedTheme, setResolvedTheme] = useState('light');

  const [projects, setProjects] = useState([]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  useEffect(() => {
    const storedTheme = window.localStorage.getItem('bucket-theme');
    if (storedTheme) {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const apiBase =
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const response = await fetch(`${apiBase}/api/projects`, {
          credentials: 'include',
        });
        if (!response.ok) {
          setProjects([]);
          return;
        }
        const data = await response.json();
        setProjects(data.projects || []);
      } catch (error) {
        setProjects([]);
      }
    };

    loadProjects();
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const resolveTheme = (themeValue) => {
      if (themeValue === 'system') {
        return media.matches ? 'dark' : 'light';
      }
      return themeValue;
    };

    const applyTheme = (themeValue) => {
      const effectiveTheme = resolveTheme(themeValue);
      setResolvedTheme(effectiveTheme);
      if (effectiveTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme(theme);
    window.localStorage.setItem('bucket-theme', theme);

    const handleSystemChange = () => {
      if (theme === 'system') {
        applyTheme(theme);
      }
    };

    if (media.addEventListener) {
      media.addEventListener('change', handleSystemChange);
    } else {
      media.addListener(handleSystemChange);
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', handleSystemChange);
      } else {
        media.removeListener(handleSystemChange);
      }
    };
  }, [theme]);

  const value = {
    isSidebarCollapsed,
    toggleSidebar,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    projects,
    setProjects,
    projectsView,
    setProjectsView,
    theme,
    setTheme,
    resolvedTheme,
  };

  return <Context.Provider value={value}>{children}</Context.Provider>;
}
