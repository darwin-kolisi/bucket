'use client';
import Image from 'next/image';
import './Header.css';

export default function Header() {
  return (
    <header className="main-header">
      <div className="header-container">
        <div className="header-left">
          <div className="logo-section">
            <h2 className="logo">BUCKET</h2>
            <span className="logo-subtitle">project management</span>
          </div>
        </div>

        <div className="header-right">
          <div className="search-container">
            <div className="search-input-wrapper">
              <svg
                className="search-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>

              <input
                className="search-input"
                type="text"
                placeholder="Search..."
              />

              <div className="search-shortcut">
                <span>⌘</span>
                <span>F</span>
              </div>
            </div>
          </div>

          <button className="header-btn">
            <Image
              src="/notification.svg"
              alt="notification"
              width={20}
              height={20}
            />
          </button>

          <button className="profile-btn">
            <div className="avatar">BS</div>
          </button>
        </div>
      </div>
    </header>
  );
}
