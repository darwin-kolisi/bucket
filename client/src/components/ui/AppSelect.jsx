'use client';

import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';

export default function AppSelect({
  value,
  onChange,
  options,
  placeholder = 'Select',
  disabled = false,
}) {
  const selected = options.find((option) => option.value === value) || null;

  return (
    <Listbox value={value} onChange={onChange} disabled={disabled}>
      <div className="relative">
        <ListboxButton
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 pr-10 text-left text-sm text-gray-900 transition focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400">
          <span className="block truncate">{selected?.label || placeholder}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg
              className="h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m19.5 8.25-7.5 7.5-7.5-7.5"
              />
            </svg>
          </span>
        </ListboxButton>

        <ListboxOptions
          anchor="bottom"
          className="z-50 mt-1 max-h-64 w-[var(--button-width)] overflow-auto rounded-xl border border-gray-200 bg-white p-1 text-sm shadow-lg focus:outline-none [--anchor-gap:4px]">
          {options.map((option) => (
            <ListboxOption
              key={option.value}
              value={option.value}
              className="group flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-gray-700 data-[focus]:bg-gray-100 data-[selected]:bg-gray-100 data-[selected]:text-gray-900">
              <span className="truncate">{option.label}</span>
              <svg
                className="h-4 w-4 text-gray-700 opacity-0 group-data-[selected]:opacity-100"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75 10.5 18l9-13.5"
                />
              </svg>
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  );
}
