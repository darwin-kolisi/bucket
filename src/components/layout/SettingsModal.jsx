'use client';

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function SettingsModal({ isOpen, onClose }) {
  const [activeSection, setActiveSection] = useState('general');

  if (!isOpen) return null;

  const settingSections = [
    { id: 'general', label: 'General' },
    { id: 'account', label: 'Account' },
    { id: 'appearance', label: 'Appearance' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">
          <p>This castle is in, an unacceptable condition!</p>
        </div>
      </div>
    </div>
  );
}
