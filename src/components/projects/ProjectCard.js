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

  const handleEdit = () => {
    onEditProject(project);
  };

  const handleDuplicate = () => {
    onDuplicateProject(project.id);
  };

  const handleDelete = () => {
    onDeleteProject(project.id);
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'in progress':
        return 'status-in-progress';
      case 'on track':
        return 'status-on-track';
      case 'at risk':
        return 'status-at-risk';
      case 'completed':
        return 'status-completed';
      default:
        return '';
    }
  };

  return (
    <div className="project-card" onClick={handleCardClick}>
      <div className="project-card-header">
        <h3>{project.name}</h3>
        <div className="options-container" ref={menuRef}>
          <Menu>
            <MenuButton className="options-btn">⋯</MenuButton>
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
                      ⌘⌫
                    </kbd>
                  </button>
                )}
              </MenuItem>
            </MenuItems>
          </Menu>
        </div>
      </div>
      <p className="project-description">{project.description}</p>
      <div className="project-card-footer">
        <span className="due-date">Due: {project.dueDate}</span>
        <span className={`status-badge ${getStatusClass(project.status)}`}>
          {project.status}
        </span>
      </div>
    </div>
  );
}
