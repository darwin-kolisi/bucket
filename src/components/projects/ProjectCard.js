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

  const getStatusClasses = (status) => {
    switch (status.toLowerCase()) {
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'on track':
        return 'bg-green-100 text-green-800';
      case 'at risk':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
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
        <span
          className={`px-2.5 py-1 rounded-xl text-xs font-semibold uppercase ${getStatusClasses(
            project.status
          )}`}>
          {project.status}
        </span>
      </div>
    </div>
  );
}
