'use client';

import { useState } from 'react';
import Image from 'next/image';
import './Sidebar.css';

export default function Sidebar({ activeItem = 'dashboard', onItemSelect }) {
  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2">
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
      ),
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2">
          <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
        </svg>
      ),
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
  ];

  const bucketItems = [
    {
      id: 'personal',
      label: 'Personal',
      count: 12,
      color: '#3b82f6',
    },
    {
      id: 'work',
      label: 'Work',
      count: 8,
      color: '#10b981',
    },
    {
      id: 'learning',
      label: 'Learning',
      count: 5,
      color: '#f59e0b',
    },
  ];

  const handleItemClick = (itemId) => {
    if (onItemSelect) {
      onItemSelect(itemId);
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Image
            src="/cat.gif"
            alt=""
            className="logo-icon"
            width={30}
            height={30}
          />
          <div className="logo-text-container">
            <h3 className="logo-text">BUCKET</h3>
          </div>
        </div>

        <div className="sidebar-close">
          <button className="close-sidebar-btn">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeItem === item.id ? 'active' : ''}`}
              onClick={() => handleItemClick(item.id)}>
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="nav-section">
          <div className="section-header">
            <span className="section-title">Buckets</span>
          </div>
          {bucketItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item bucket-item ${
                activeItem === item.id ? 'active' : ''
              }`}
              onClick={() => handleItemClick(item.id)}>
              <div
                className="bucket-indicator"
                style={{ backgroundColor: item.color }}></div>
              <span className="nav-label">{item.label}</span>
              <span className="item-count">{item.count}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">BS</div>
          <div className="user-info">
            <div className="user-name">Black Sabbath</div>
            <div className="user-email">beepboop@example.com</div>
          </div>
          <button className="user-menu-btn">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2">
              <polyline points="6,9 12,15 18,9" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
