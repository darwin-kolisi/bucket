'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useClickOutside } from '@react-hooks-hub/use-click-outside';
import { CalendarIcon, ChevronDownIcon } from '@/components/icons/Icons';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const pad = (value) => String(value).padStart(2, '0');

const toDateString = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const parseDate = (value) => {
  if (!value) return null;
  const [year, month, day] = value.split('-').map((part) => Number(part));
  if (!year || !month || !day) return null;
  const parsed = new Date(year, month - 1, day);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

const formatDisplay = (value) => {
  const parsed = parseDate(value);
  if (!parsed) return '';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
};

export default function DatePicker({
  value,
  onChange,
  max,
  placeholder = 'DD / MM / YYYY',
  onInvalid,
  inputClassName = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef(null);
  const [monthOpen, setMonthOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);

  const selectedDate = parseDate(value);
  const [viewDate, setViewDate] = useState(
    selectedDate
      ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

  const maxValue = max || '';
  const todayValue = useMemo(() => toDateString(new Date()), []);
  const yearOptions = useMemo(() => {
    const years = [];
    for (let year = 2000; year <= 2100; year += 1) {
      years.push(year);
    }
    return years;
  }, []);

  useClickOutside([anchorRef], () => setIsOpen(false));

  useEffect(() => {
    if (!isOpen) {
      setMonthOpen(false);
      setYearOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!value) return;
    const parsed = parseDate(value);
    if (!parsed) return;
    setViewDate(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
  }, [value]);

  const days = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const offset = firstDay.getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < offset; i += 1) {
      cells.push(null);
    }
    for (let day = 1; day <= totalDays; day += 1) {
      cells.push(day);
    }
    return cells;
  }, [viewDate]);

  const handleSelect = (dateString) => {
    if (maxValue && dateString > maxValue) {
      if (onInvalid) onInvalid();
      return;
    }
    onChange(dateString);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  const changeMonth = (direction) => {
    const next = new Date(viewDate);
    next.setMonth(viewDate.getMonth() + direction);
    setViewDate(new Date(next.getFullYear(), next.getMonth(), 1));
  };

  const handleMonthSelect = (month) => {
    if (Number.isNaN(month)) return;
    setViewDate(new Date(viewDate.getFullYear(), month, 1));
    setMonthOpen(false);
  };

  const handleYearSelect = (year) => {
    if (Number.isNaN(year)) return;
    setViewDate(new Date(year, viewDate.getMonth(), 1));
    setYearOpen(false);
  };

  const toggleMonth = () => {
    setMonthOpen((prev) => !prev);
    setYearOpen(false);
  };

  const toggleYear = () => {
    setYearOpen((prev) => !prev);
    setMonthOpen(false);
  };

  const label =
    selectedDate && !Number.isNaN(selectedDate.getTime())
      ? formatDisplay(value)
      : '';

  return (
    <div className="relative" ref={anchorRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full h-10.5 px-4 border border-gray-200 rounded-lg text-sm text-left focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 bg-white flex items-center justify-between gap-2 ${inputClassName}`}>
        <span className={label ? 'text-gray-900' : 'text-gray-400'}>
          {label || placeholder}
        </span>
        <CalendarIcon className="h-4 w-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-[280px] rounded-2xl border border-gray-200 bg-white shadow-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="h-8 w-8 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors">
              &lt;
            </button>
            <div className="flex items-center gap-2 relative">
              <button
                type="button"
                onClick={toggleMonth}
                aria-expanded={monthOpen}
                className="h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 inline-flex items-center gap-1">
                {MONTHS[viewDate.getMonth()]}
                <ChevronDownIcon className="h-3.5 w-3.5 text-gray-400" />
              </button>
              {monthOpen && (
                <div className="absolute left-0 top-10 z-10 w-48 rounded-xl border border-gray-200 bg-white shadow-lg p-2 grid grid-cols-2 gap-1">
                  {MONTHS.map((month, index) => (
                    <button
                      key={month}
                      type="button"
                      onClick={() => handleMonthSelect(index)}
                      className={`h-8 rounded-lg text-[11px] font-semibold transition-colors ${
                        viewDate.getMonth() === index
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}>
                      {month}
                    </button>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={toggleYear}
                aria-expanded={yearOpen}
                className="h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 inline-flex items-center gap-1">
                {viewDate.getFullYear()}
                <ChevronDownIcon className="h-3.5 w-3.5 text-gray-400" />
              </button>
              {yearOpen && (
                <div className="absolute right-0 top-10 z-10 w-28 rounded-xl border border-gray-200 bg-white shadow-lg p-2 max-h-48 overflow-y-auto">
                  {yearOptions.map((year) => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => handleYearSelect(year)}
                      className={`h-7 w-full rounded-lg text-[11px] font-semibold transition-colors ${
                        viewDate.getFullYear() === year
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}>
                      {year}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="h-8 w-8 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors">
              &gt;
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2 text-[11px] font-semibold text-gray-500">
            {WEEKDAYS.map((day) => (
              <div key={day} className="text-center">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} />;
              }
              const dateString = `${viewDate.getFullYear()}-${pad(
                viewDate.getMonth() + 1
              )}-${pad(day)}`;
              const isSelected = value === dateString;
              const isToday = todayValue === dateString;
              const isAfterMax = maxValue && dateString > maxValue;
              return (
                <button
                  key={dateString}
                  type="button"
                  onClick={() => handleSelect(dateString)}
                  className={`h-9 w-9 rounded-lg text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-gray-900 text-white'
                      : isAfterMax
                        ? 'text-gray-300 hover:bg-red-50 hover:text-red-500'
                        : 'text-gray-700 hover:bg-gray-100'
                  } ${isToday && !isSelected ? 'border border-gray-300' : ''}`}
                  aria-label={dateString}>
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={handleClear}
              className="text-xs font-semibold text-gray-500 hover:text-gray-700">
              Clear
            </button>
            {maxValue ? (
              <span className="text-[10px] text-gray-400">
                Max: {formatDisplay(maxValue)}
              </span>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
