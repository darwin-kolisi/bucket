'use client';

import { ChevronDownIcon } from '@/components/icons/Icons';

const statusOptions = ['on-track', 'at-risk', 'completed'];
const orderOptions = [
  { id: 'newest', label: 'Newest' },
  { id: 'oldest', label: 'Oldest' },
  { id: 'due-soon', label: 'Due soon' },
];

export default function ProjectsSortMenu({
  isOpen,
  setIsOpen,
  effectiveStatusFilter,
  sortOption,
  onStatusChange,
  onSortChange,
  onReset,
}) {
  const isSortActive =
    isOpen || effectiveStatusFilter !== 'all' || sortOption !== 'newest';

  const handleToggle = () => {
    setIsOpen((current) => !current);
  };

  const handleReset = () => {
    onReset();
    setIsOpen(false);
  };

  const handleStatusSelect = (value) => {
    onStatusChange(value);
    setIsOpen(false);
  };

  const handleOrderSelect = (value) => {
    onSortChange(value);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={handleToggle}
        aria-expanded={isSortActive}
        className={`btn-dark-hover flex items-center gap-2 px-3 h-9.5 !min-h-[38px] text-xs font-semibold transition-colors rounded-lg border border-gray-200 sm:px-4 sm:h-9.5 sm:text-sm ${
          isSortActive
            ? 'bg-gray-100 text-gray-900'
            : 'bg-white text-gray-700 hover:text-gray-900 hover:bg-gray-50'
        }`}>
        <span className="inline-flex items-center gap-2">
          <span>Sort</span>
          {isSortActive && (
            <span className="h-1.5 w-1.5 rounded-full bg-gray-900" />
          )}
        </span>
        <ChevronDownIcon className="h-4 w-4" />
      </button>
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 origin-top-right rounded-2xl border border-gray-200 bg-gray-100 p-3 text-xs text-gray-900 shadow-xl z-50">
          <div className="flex items-center justify-between px-1 pb-2">
            <span className="text-[11px] font-semibold text-gray-700">
              Sort & Filter
            </span>
            <button
              onClick={handleReset}
              className="text-[11px] font-semibold text-gray-500 hover:text-gray-700">
              Reset
            </button>
          </div>
          <div className="mt-2">
            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
              Status
            </div>
            <div className="mt-2 grid grid-cols-3 gap-1 rounded-xl border border-gray-200 bg-white p-1">
              {statusOptions.map((value) => (
                <button
                  key={value}
                  onClick={() => handleStatusSelect(value)}
                  className={`btn-dark-hover h-8 whitespace-nowrap rounded-lg px-2 text-[11px] font-semibold transition ${
                    effectiveStatusFilter === value
                      ? 'bg-gray-100 text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}>
                  {value === 'on-track'
                    ? 'On Track'
                    : value === 'at-risk'
                      ? 'At Risk'
                      : 'Completed'}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
              Order
            </div>
            <div className="mt-2 grid grid-cols-3 gap-1 rounded-xl border border-gray-200 bg-white p-1">
              {orderOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleOrderSelect(option.id)}
                  className={`btn-dark-hover h-8 whitespace-nowrap rounded-lg px-2 text-[11px] font-semibold transition ${
                    sortOption === option.id
                      ? 'bg-gray-100 text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}>
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
