import { useRef } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import {
  PencilIcon,
  Square2StackIcon,
  TrashIcon,
} from '@heroicons/react/16/solid';

export default function ProjectCard({
  project,
  onEditProject,
  onDuplicateProject,
  onDeleteProject,
  onProjectClick,
}) {
  const menuRef = useRef(null);

  const handleCardClick = (e) => {
    if (!e.target.closest('.options-container')) {
      onProjectClick(project);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEditProject(project);
  };

  const handleDuplicate = (e) => {
    e.stopPropagation();
    onDuplicateProject(project.id);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDeleteProject(project.id);
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'in progress':
        return (
          <svg
            className="h-4 w-4 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
            />
          </svg>
        );
      case 'on track':
        return (
          <svg
            className="h-4 w-4 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        );
      case 'at risk':
        return (
          <svg
            className="h-4 w-4 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
            />
          </svg>
        );
      case 'completed':
        return (
          <svg
            className="h-4 w-4 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4.5 12.75 6 6 9-13.5"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex flex-col cursor-pointer hover:bg-gray-100 transition-colors duration-150"
      onClick={handleCardClick}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-900 m-0">
          {project.name}
        </h3>
        <div className="options-container relative" ref={menuRef}>
          <Menu>
            <MenuButton className="text-2xl text-gray-400 bg-none border-none cursor-pointer p-0 leading-none hover:text-gray-600 transition-colors">
              ⋯
            </MenuButton>
            <MenuItems
              transition
              anchor="bottom end"
              className="w-52 origin-top-right rounded-xl border border-gray-200 bg-white p-1 text-sm/6 text-gray-900 shadow-lg transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0 z-50">
              <MenuItem>
                {({ focus }) => (
                  <button
                    onClick={handleEdit}
                    className={`group flex w-full items-center gap-2 rounded-lg px-3 py-2 ${
                      focus ? 'bg-gray-100' : ''
                    }`}>
                    <PencilIcon className="size-4 fill-gray-400" />
                    Edit
                    <kbd
                      className={`ml-auto font-sans text-xs text-gray-500 ${
                        focus ? 'inline' : 'hidden'
                      }`}>
                      ⌘E
                    </kbd>
                  </button>
                )}
              </MenuItem>
              <MenuItem>
                {({ focus }) => (
                  <button
                    onClick={handleDuplicate}
                    className={`group flex w-full items-center gap-2 rounded-lg px-3 py-2 ${
                      focus ? 'bg-gray-100' : ''
                    }`}>
                    <Square2StackIcon className="size-4 fill-gray-400" />
                    Duplicate
                    <kbd
                      className={`ml-auto font-sans text-xs text-gray-500 ${
                        focus ? 'inline' : 'hidden'
                      }`}>
                      ⌘D
                    </kbd>
                  </button>
                )}
              </MenuItem>
              <div className="my-1 h-px bg-gray-200" />
              <MenuItem>
                {({ focus }) => (
                  <button
                    onClick={handleDelete}
                    className={`group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-red-600 ${
                      focus ? 'bg-red-50' : ''
                    }`}>
                    <TrashIcon className="size-4 fill-red-400" />
                    Delete
                    <kbd
                      className={`ml-auto font-sans text-xs text-gray-500 ${
                        focus ? 'inline' : 'hidden'
                      }`}>
                      ⌘D
                    </kbd>
                  </button>
                )}
              </MenuItem>
            </MenuItems>
          </Menu>
        </div>
      </div>
      <p className="text-sm text-gray-600 m-0 mb-6 leading-relaxed flex-grow">
        {project.description}
      </p>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-700 font-medium">
          Due: {project.dueDate}
        </span>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-50">
          {getStatusIcon(project.status)}
          <span className="text-xs font-medium text-gray-700">
            {project.status}
          </span>
        </div>
      </div>
    </div>
  );
}
