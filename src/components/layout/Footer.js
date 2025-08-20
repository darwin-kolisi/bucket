'use client';
import Image from 'next/image';
import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-left">
            <div className="footer-brand">
              <h3 className="footer-logo">BUCKET</h3>
              <p className="footer-description">
                Simple project management for a focused mind
              </p>
            </div>
          </div>

          <div className="footer-center">
            <p className="copyright">
              © {currentYear} bucket. All rights reserved.
            </p>
          </div>

          <div className="footer-right">
            <div className="social-links">
              <button
                className="social-btn"
                onClick={() =>
                  handleLinkClick('https://github.com/darwin-kolisi/bucket')
                }
                aria-label="GitHub">
                <Image
                  src="/octocat.svg"
                  alt="GitHub"
                  width="30"
                  height="30"
                  className="social-icon"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
