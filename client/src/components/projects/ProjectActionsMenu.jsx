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
  onDelete,
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
          className={`rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 ${buttonClassName}`.trim()}>
          <EllipsisVerticalIcon className="h-4 w-4" />
        </MenuButton>
        <MenuItems
          transition
          anchor="bottom end"
          className="w-52 origin-top-right rounded-xl border border-gray-200 bg-white p-1 text-sm/6 text-gray-900 shadow-lg transition duration-100 ease-out focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0 z-50 [--anchor-gap:var(--spacing-1)]">
          <MenuItem>
            <button
              onClick={(event) => handleAction(event, onEdit)}
              className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-50 text-left">
              <EditIcon className="h-4 w-4 text-gray-400" />
              Edit
            </button>
          </MenuItem>
          <MenuItem>
            <button
              onClick={(event) => handleAction(event, onDuplicate)}
              className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-50 text-left">
              <DuplicateIcon className="h-4 w-4 text-gray-400" />
              Duplicate
            </button>
          </MenuItem>
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
