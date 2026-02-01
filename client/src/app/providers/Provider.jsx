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

  const initialProjects = [
    {
      id: 1,
      name: 'bucket',
      description: 'project management app',
      dueDate: '10 Nov 2025',
      status: 'In Progress',
      tasks: [
        {
          id: 1,
          title: 'Create landing page design',
          subtitle: 'Marketing website',
          date: '15 Sept 2025',
          progress: 0,
          total: 10,
          status: 'todo',
          priority: 'high',
          subtasks: [
            { id: 1, title: 'Design header section', completed: false },
            { id: 2, title: 'Create hero banner', completed: false },
            { id: 3, title: 'Design footer', completed: false },
          ],
        },
        {
          id: 2,
          title: 'Update component library',
          subtitle: 'Design system',
          date: '18 Oct 2025',
          progress: 0,
          total: 8,
          status: 'todo',
          priority: 'low',
        },
      ],
    },
    {
      id: 2,
      name: 'consumption-doc',
      description: 'media log',
      dueDate: '18 Nov 2025',
      status: 'On Track',
      tasks: [
        {
          id: 1,
          title: 'Design media upload interface',
          subtitle: 'User experience',
          date: '16 Oct 2025',
          progress: 0,
          total: 8,
          status: 'todo',
          priority: 'high',
        },
        {
          id: 2,
          title: 'Implement search functionality',
          subtitle: 'Backend integration',
          date: '19 Oct 2025',
          progress: 0,
          total: 6,
          status: 'todo',
          priority: 'medium',
        },
      ],
    },
    {
      id: 3,
      name: 'beep boop',
      description: 'my resume/cv website',
      dueDate: '20 Oct 2025',
      status: 'At Risk',
      tasks: [],
    },
    {
      id: 4,
      name: 'employment',
      description: 'get a job...',
      dueDate: '25 Oct 2025',
      status: 'At Risk',
      tasks: [],
    },
    {
      id: 5,
      name: 'physics',
      description: 'want to get into circuits and physics',
      dueDate: '28 Oct 2025',
      status: 'At Risk',
      tasks: [],
    },
  ];

  const [projects, setProjects] = useState(initialProjects);

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
