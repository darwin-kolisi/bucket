'use client';

export default function Header({ isCollapsed }) {
  return (
    <header
      className={`sticky top-0 z-40 border-b border-gray-200 bg-white transition-[margin-left] duration-300 ease-in-out ${
        isCollapsed ? 'ml-[88px]' : 'ml-[280px]'
      }`}>
      <div className="h-20 w-full"></div>
    </header>
  );
}
