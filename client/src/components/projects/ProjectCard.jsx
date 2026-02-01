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

  const completionPercentage =
    project.totalTasks > 0
      ? Math.round((project.completedTasks / project.totalTasks) * 100)
      : 0;

  return (
    <div
      className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col cursor-pointer transition-shadow duration-150"
      onClick={handleCardClick}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
            {project.name}
          </h3>
          <div className="flex items-center gap-2">
            {getStatusIcon(project.status)}
            <span className="text-sm font-medium text-gray-600">
              {project.status}
            </span>
          </div>
        </div>

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
                    className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100 text-left">
                    <svg
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                      />
                    </svg>
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
                    className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100 text-left">
                    <svg
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
                      />
                    </svg>
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
                    className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-red-600 hover:bg-red-50 text-left">
                    <svg
                      className="h-4 w-4 text-red-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                      />
                    </svg>
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

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-semibold text-gray-900">
            {completionPercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gray-900 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>
            {project.completedTasks || 0} of {project.totalTasks || 0} tasks
            completed
          </span>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5"
              />
            </svg>
            <span className="text-sm font-medium text-gray-600">
              Due: {project.dueDate}
            </span>
          </div>

          {project.priority && (
            <span
              className={`px-2 py-1 rounded-md text-xs font-medium ${getPriorityColor(
                project.priority
              )}`}>
              {project.priority}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <svg
            className="h-4 w-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
            />
          </svg>
          <span className="text-sm text-gray-600">
            {project.notesCount > 0
              ? `${project.notesCount} notes`
              : 'No notes yet'}
          </span>
        </div>
      </div>

      {project.tags && project.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
              {tag}
            </span>
          ))}
          {project.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-md text-xs font-medium">
              +{project.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
