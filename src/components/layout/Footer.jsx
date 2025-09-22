'use client';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Footer({ isCollapsed }) {
  const [isMobile, setIsMobile] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLinkClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <footer
      className={`mt-auto border-t border-gray-200 bg-white transition-all duration-300 ease-in-out ${
        isMobile ? 'ml-0' : isCollapsed ? 'ml-[70px]' : 'ml-[220px]'
      }`}>
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-4 lg:py-3">
        <div className="flex flex-col gap-4 items-center text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex flex-col items-center sm:items-start">
            <div className="flex flex-col">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                BUCKET
              </h3>
              <p className="max-w-[250px] text-sm leading-relaxed text-gray-600">
                Simple project management for a focused mind
              </p>
            </div>
          </div>

          <div className="order-3 sm:order-2">
            <p className="text-sm text-gray-600">
              © {currentYear} bucket. All rights reserved.
            </p>
          </div>

          <div className="order-2 sm:order-3">
            <button
              onClick={() =>
                handleLinkClick('https://github.com/darwin-kolisi/bucket')
              }
              aria-label="GitHub"
              className="rounded-lg border border-gray-200 bg-transparent px-4 py-2 text-sm font-medium text-gray-600 transition-colors duration-200 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900">
              <Image
                src="/octocat.svg"
                alt="GitHub"
                width="24"
                height="24"
                className="social-icon"
              />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
