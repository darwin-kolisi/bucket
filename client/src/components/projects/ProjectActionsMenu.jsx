import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import {
  DuplicateIcon,
  EditIcon,
  EllipsisVerticalIcon,
  TrashIcon,
} from '@/components/icons/Icons';

export default function ProjectActionsMenu({
  onEdit,
  onDuplicate,
  onOpenNotes,
  onDelete,
  onToggleStar,
  isStarred = false,
  className = '',
  buttonClassName = '',
}) {
  const handleAction = (event, action) => {
    event.stopPropagation();
    if (action) {
      action();
    }
  };

  return (
    <div className={`options-container ${className}`.trim()}>
      <Menu>
        <MenuButton
          onClick={(event) => event.stopPropagation()}
          className={`btn-dark-hover rounded-md p-1 text-gray-400 transition hover:bg-gray-50 hover:text-gray-600 ${buttonClassName}`.trim()}>
          <EllipsisVerticalIcon className="h-4 w-4" />
        </MenuButton>
        <MenuItems
          transition
          anchor="bottom end"
          className="w-52 origin-top-right rounded-xl border border-gray-200 bg-white p-1 text-sm/6 text-gray-900 shadow-lg transition duration-100 ease-out focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0 z-50 [--anchor-gap:var(--spacing-1)]">
          <MenuItem>
            <button
              onClick={(event) => handleAction(event, onEdit)}
              className="btn-dark-hover group flex w-full items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-50 text-left">
              <EditIcon className="h-4 w-4 text-gray-400" />
              Edit
            </button>
          </MenuItem>
          <MenuItem>
            <button
              onClick={(event) => handleAction(event, onDuplicate)}
              className="btn-dark-hover group flex w-full items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-50 text-left">
              <DuplicateIcon className="h-4 w-4 text-gray-400" />
              Duplicate
            </button>
          </MenuItem>
          <MenuItem>
            <button
              onClick={(event) => handleAction(event, onOpenNotes)}
              className="btn-dark-hover group flex w-full items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-50 text-left">
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"
                />
                <polyline points="14,2 14,8 20,8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              Notes
            </button>
          </MenuItem>
          {onToggleStar && <div className="my-1 h-px bg-gray-200" />}
          {onToggleStar && (
            <MenuItem>
              <button
                onClick={(event) => handleAction(event, onToggleStar)}
                className="btn-dark-hover group flex w-full items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-50 text-left">
                <span className="text-[14px] text-gray-400">
                  {isStarred ? '★' : '☆'}
                </span>
                {isStarred ? 'Unstar' : 'Star'}
              </button>
            </MenuItem>
          )}
          <div className="my-1 h-px bg-gray-200" />
          <MenuItem>
            <button
              onClick={(event) => handleAction(event, onDelete)}
              className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-red-600 hover:bg-red-50 text-left">
              <TrashIcon className="h-4 w-4 text-red-400" />
              Delete
            </button>
          </MenuItem>
        </MenuItems>
      </Menu>
    </div>
  );
}
