'use client';

import { useState, useRef, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useAppContext } from '@/app/providers/Provider';

export default function SettingsModal({ isOpen, onClose }) {
  const [activeSection, setActiveSection] = useState('general');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showTimezoneDropdown, setShowTimezoneDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedTimezone, setSelectedTimezone] = useState('UTC-5 (EST)');
  const { theme, setTheme } = useAppContext();

  const languageDropdownRef = useRef(null);
  const timezoneDropdownRef = useRef(null);

  const languages = ['English', 'Xhosa'];
  const timezones = [
    'UTC-8 (PST)',
    'UTC-7 (MST)',
    'UTC-6 (CST)',
    'UTC-5 (EST)',
    'UTC+0 (GMT)',
    'UTC+1 (CET)',
  ];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target)
      ) {
        setShowLanguageDropdown(false);
      }
      if (
        timezoneDropdownRef.current &&
        !timezoneDropdownRef.current.contains(event.target)
      ) {
        setShowTimezoneDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const settingSections = [
    {
      id: 'general',
      label: 'General',
      icon: (
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
    {
      id: 'account',
      label: 'Account',
      icon: (
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
          />
        </svg>
      ),
    },
    {
      id: 'appearance',
      label: 'Appearance',
      icon: (
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z"
          />
        </svg>
      ),
    },
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Language & Region
        </label>
        <div className="space-y-3">
          <div className="relative" ref={languageDropdownRef}>
            <button
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className="flex items-center justify-between w-full px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent">
              <span className="text-gray-900">{selectedLanguage}</span>
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m19.5 8.25-7.5 7.5-7.5-7.5"
                />
              </svg>
            </button>

            {showLanguageDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-1">
                {languages.map((language) => (
                  <button
                    key={language}
                    onClick={() => {
                      setSelectedLanguage(language);
                      setShowLanguageDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-gray-100 rounded-lg">
                    {language}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative" ref={timezoneDropdownRef}>
            <button
              onClick={() => setShowTimezoneDropdown(!showTimezoneDropdown)}
              className="flex items-center justify-between w-full px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent">
              <span className="text-gray-900">{selectedTimezone}</span>
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m19.5 8.25-7.5 7.5-7.5-7.5"
                />
              </svg>
            </button>

            {showTimezoneDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-1">
                {timezones.map((timezone) => (
                  <button
                    key={timezone}
                    onClick={() => {
                      setSelectedTimezone(timezone);
                      setShowTimezoneDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-gray-100 rounded-lg">
                    {timezone}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAccountSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Profile Information
        </label>
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-gray-900 rounded-full flex items-center justify-center text-white font-semibold text-lg">
              BS
            </div>
            <div className="flex-1">
              <input
                type="text"
                defaultValue="Black Sabbath"
                className="w-full px-3 py-2 text-gray-700 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
              <input
                type="email"
                defaultValue="beepboop@example.com"
                className="w-full px-3 py-2 text-gray-700 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent mt-2"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Theme
        </label>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setTheme('light')}
            className={`p-3 border rounded-lg text-center transition-all ${
              theme === 'light'
                ? 'border-gray-900 bg-gray-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}>
            <div className="w-full h-12 theme-preview-light border border-gray-200 rounded mb-2 flex items-center justify-center">
              <div className="w-4 h-4 theme-preview-light-swatch rounded"></div>
            </div>
            <span className="text-xs font-medium text-gray-900">Light</span>
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`p-3 border rounded-lg text-center transition-all ${
              theme === 'dark'
                ? 'border-gray-900 bg-gray-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}>
            <div className="w-full h-12 bg-gray-800 border border-gray-600 rounded mb-2 flex items-center justify-center">
              <div className="w-4 h-4 bg-gray-600 rounded"></div>
            </div>
            <span className="text-xs font-medium text-gray-900">Dark</span>
          </button>

          <button
            onClick={() => setTheme('system')}
            className={`p-3 border rounded-lg text-center transition-all ${
              theme === 'system'
                ? 'border-gray-900 bg-gray-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}>
            <div className="w-full h-12 bg-gradient-to-r from-white to-gray-800 border border-gray-300 rounded mb-2 flex items-center justify-center">
              <div className="w-4 h-4 bg-gradient-to-r from-gray-200 to-gray-600 rounded"></div>
            </div>
            <span className="text-xs font-medium text-gray-900">System</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return renderGeneralSettings();
      case 'account':
        return renderAccountSettings();
      case 'appearance':
        return renderAppearanceSettings();
      default:
        return renderGeneralSettings();
    }
  };

  if (isMobile) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-900">Settings</h1>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto px-4">
            {settingSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeSection === section.id
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}>
                {section.icon}
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4">
            <h2 className="text-lg font-medium text-gray-900 capitalize">
              {activeSection}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {activeSection === 'general' &&
                'Configure language and regional settings'}
              {activeSection === 'account' && 'Manage your account information'}
              {activeSection === 'appearance' &&
                'Customize the look and feel of your workspace'}
            </p>
          </div>

          {renderContent()}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-opacity-40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl h-[600px] flex overflow-hidden">
        <div className="w-64 border-r border-gray-200 p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <nav className="space-y-1">
            {settingSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition-colors ${
                  activeSection === section.id
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}>
                {section.icon}
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900 capitalize">
              {activeSection}
            </h3>
            <p className="text-sm text-gray-500">
              {activeSection === 'general' &&
                'Configure language and regional settings'}
              {activeSection === 'account' && 'Manage your account information'}
              {activeSection === 'appearance' &&
                'Customize the look and feel of your workspace'}
            </p>
          </div>

          {renderContent()}
        </div>
      </div>
    </div>
  );
}
