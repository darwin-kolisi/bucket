'use client';
import Image from 'next/image';

export default function Footer({ isCollapsed }) {
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <footer
      className={`mt-auto border-t border-gray-200 bg-white transition-[margin-left] duration-300 ease-in-out ${
        isCollapsed ? 'ml-[88px]' : 'ml-[280px]'
      }`}>
      <div className="mx-auto max-w-[1400px] px-8 py-1.5">
        <div className="grid grid-cols-1 items-center gap-6 text-center md:grid-cols-3 md:text-left">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex flex-col">
              <h3 className="mb-2 text-xl font-bold text-gray-900">BUCKET</h3>
              <p className="max-w-[250px] text-sm leading-relaxed text-gray-600">
                Simple project management for a focused mind
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <p className="text-sm text-gray-600">
              © {currentYear} bucket. All rights reserved.
            </p>
          </div>

          <div className="flex justify-center md:justify-end">
            <div className="flex">
              <button
                onClick={() =>
                  handleLinkClick('https://github.com/darwin-kolisi/bucket')
                }
                aria-label="GitHub"
                className="rounded-lg border border-gray-200 bg-transparent px-4 py-2 text-sm font-medium text-gray-600 transition-colors duration-200 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900">
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
