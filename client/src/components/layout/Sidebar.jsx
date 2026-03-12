'use client';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/app/providers/Provider';
import { useErrorToast } from '@/components/ui/ErrorToastProvider';

const getWorkspaceGif = (name) => {
  const normalized = name?.toString().toLowerCase() || '';
  if (normalized.includes('personal')) {
    return '/personal-minecraft-sheep.gif';
  }
  if (normalized.includes('work')) {
    return '/work-jake.gif';
  }
  return '/productive-cat.gif';
};

const WORKSPACE_TEMPLATES = [
  {
    id: 'work',
    title: 'For work',
    description: 'Track team projects, timelines, and deliverables.',
    defaultName: 'Work',
  },
  {
    id: 'personal',
    title: 'For personal life',
    description: 'Plan goals, habits, routines, and personal tasks.',
    defaultName: 'Personal',
  },
  {
    id: 'school',
    title: 'For school',
    description: 'Organize classes, assignments, and revision notes.',
    defaultName: 'School',
  },
];

const getWorkspaceTemplateIcon = (templateId) => {
  if (templateId === 'work') {
    return (
      <svg
        className="h-4 w-4 text-gray-700"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round">
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M3 12h18" />
      </svg>
    );
  }

  if (templateId === 'personal') {
    return (
      <svg
        className="h-4 w-4 text-gray-700"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round">
        <path d="m3 11.5 9-8 9 8" />
        <path d="M5.5 10.5V20a1 1 0 0 0 1 1H10v-6h4v6h3.5a1 1 0 0 0 1-1v-9.5" />
      </svg>
    );
  }

  return (
    <svg
      className="h-4 w-4 text-gray-700"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-13Z" />
      <path d="M4 8h16" />
      <path d="M9 4v4" />
      <path d="M15 4v4" />
      <path d="M8 13h8" />
    </svg>
  );
};

export default function Sidebar({
  activeItem = 'dashboard',
  onItemSelect,
  isCollapsed,
  onToggleCollapse,
  isMobile = false,
  isOpen = false,
  onClose,
}) {
  const router = useRouter();
  const {
    unreadNotificationsCount,
    workspaces,
    selectedWorkspaceId,
    setSelectedWorkspaceId,
    createWorkspace,
    renameWorkspace,
    deleteWorkspace,
    isWorkspacesLoading,
  } = useAppContext();
  const { pushError } = useErrorToast();
  const [isClient, setIsClient] = useState(false);
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [isRenameWorkspaceModalOpen, setIsRenameWorkspaceModalOpen] = useState(false);
  const [isDeleteWorkspaceModalOpen, setIsDeleteWorkspaceModalOpen] = useState(false);
  const [isManagingWorkspace, setIsManagingWorkspace] = useState(false);
  const [renamedWorkspaceName, setRenamedWorkspaceName] = useState('');
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');
  const [deleteSafeguards, setDeleteSafeguards] = useState(null);
  const [selectedWorkspaceTemplateId, setSelectedWorkspaceTemplateId] = useState(
    WORKSPACE_TEMPLATES[0].id
  );
  const [newWorkspaceName, setNewWorkspaceName] = useState(
    WORKSPACE_TEMPLATES[0].defaultName
  );
  const workspaceMenuRef = useRef(null);
  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
      ),
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: (
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24">
          <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
        </svg>
      ),
    },
    {
      id: 'notes',
      label: 'Notes',
      icon: (
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14,2 14,8 20,8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10,9 9,9 8,9" />
        </svg>
      ),
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: (
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
      ),
    },
  ];

  const handleItemClick = (itemId) => {
    if (onItemSelect) {
      onItemSelect(itemId);
    }
  };
  const selectedWorkspace =
    workspaces.find((workspace) => workspace.id === selectedWorkspaceId) || null;
  const selectedWorkspaceTemplate =
    WORKSPACE_TEMPLATES.find(
      (workspaceTemplate) => workspaceTemplate.id === selectedWorkspaceTemplateId
    ) || WORKSPACE_TEMPLATES[0];
  const isAnyWorkspaceModalOpen =
    isWorkspaceModalOpen || isRenameWorkspaceModalOpen || isDeleteWorkspaceModalOpen;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        workspaceMenuRef.current &&
        !workspaceMenuRef.current.contains(event.target)
      ) {
        setIsWorkspaceMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isAnyWorkspaceModalOpen) return;

    const handleEscape = (event) => {
      if (event.key !== 'Escape') return;
      if (isCreatingWorkspace || isManagingWorkspace) return;
      if (isDeleteWorkspaceModalOpen) {
        setIsDeleteWorkspaceModalOpen(false);
        return;
      }
      if (isRenameWorkspaceModalOpen) {
        setIsRenameWorkspaceModalOpen(false);
        return;
      }
      if (isWorkspaceModalOpen) {
        setIsWorkspaceModalOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [
    isAnyWorkspaceModalOpen,
    isCreatingWorkspace,
    isManagingWorkspace,
    isDeleteWorkspaceModalOpen,
    isRenameWorkspaceModalOpen,
    isWorkspaceModalOpen,
  ]);

  useEffect(() => {
    if (!isAnyWorkspaceModalOpen || !isClient) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isAnyWorkspaceModalOpen, isClient]);

  const closeWorkspaceModal = () => {
    if (isCreatingWorkspace) return;
    setIsWorkspaceModalOpen(false);
  };

  const openWorkspaceModal = () => {
    const defaultTemplate = WORKSPACE_TEMPLATES[0];
    setSelectedWorkspaceTemplateId(defaultTemplate.id);
    setNewWorkspaceName(defaultTemplate.defaultName);
    setIsWorkspaceMenuOpen(false);
    setIsWorkspaceModalOpen(true);
  };

  const closeRenameWorkspaceModal = () => {
    if (isManagingWorkspace) return;
    setIsRenameWorkspaceModalOpen(false);
  };

  const openRenameWorkspaceModal = () => {
    if (!selectedWorkspace) {
      pushError('Select a workspace first.');
      return;
    }
    setRenamedWorkspaceName(selectedWorkspace.name || '');
    setIsWorkspaceMenuOpen(false);
    setIsRenameWorkspaceModalOpen(true);
  };

  const closeDeleteWorkspaceModal = () => {
    if (isManagingWorkspace) return;
    setIsDeleteWorkspaceModalOpen(false);
  };

  const openDeleteWorkspaceModal = () => {
    if (!selectedWorkspace) {
      pushError('Select a workspace first.');
      return;
    }
    setDeleteSafeguards(null);
    setDeleteConfirmationInput('');
    setIsWorkspaceMenuOpen(false);
    setIsDeleteWorkspaceModalOpen(true);
  };

  const handleWorkspaceTemplateSelect = (template) => {
    setSelectedWorkspaceTemplateId(template.id);
    setNewWorkspaceName((currentName) => {
      const trimmedCurrentName = currentName.trim();
      const isPresetName = WORKSPACE_TEMPLATES.some(
        (workspaceTemplate) =>
          workspaceTemplate.defaultName.toLowerCase() ===
          trimmedCurrentName.toLowerCase()
      );

      if (!trimmedCurrentName || isPresetName) {
        return template.defaultName;
      }

      return currentName;
    });
  };

  const handleCreateWorkspace = async () => {
    const trimmedName = newWorkspaceName.trim();
    if (!trimmedName) {
      pushError('Workspace name is required.');
      return;
    }

    setIsCreatingWorkspace(true);
    const workspace = await createWorkspace(trimmedName);
    setIsCreatingWorkspace(false);

    if (!workspace) {
      pushError('Unable to create workspace. Please try again.');
      return;
    }

    setIsWorkspaceModalOpen(false);
  };

  const handleRenameWorkspace = async () => {
    if (!selectedWorkspace) {
      pushError('Select a workspace first.');
      return;
    }

    const trimmedName = renamedWorkspaceName.trim();
    if (!trimmedName) {
      pushError('Workspace name is required.');
      return;
    }

    setIsManagingWorkspace(true);
    const result = await renameWorkspace(selectedWorkspace.id, trimmedName);
    setIsManagingWorkspace(false);

    if (result?.workspace) {
      setIsRenameWorkspaceModalOpen(false);
      return;
    }

    pushError(result?.error || 'Unable to rename workspace. Please try again.');
  };

  const handleDeleteWorkspace = async () => {
    if (!selectedWorkspace) {
      pushError('Select a workspace first.');
      return;
    }

    if (
      deleteSafeguards?.workspaceName &&
      deleteConfirmationInput.trim() !== deleteSafeguards.workspaceName
    ) {
      pushError(`Type "${deleteSafeguards.workspaceName}" to confirm deletion.`);
      return;
    }

    setIsManagingWorkspace(true);
    const result = deleteSafeguards
      ? await deleteWorkspace(selectedWorkspace.id, {
          force: true,
          confirmation: deleteConfirmationInput.trim(),
        })
      : await deleteWorkspace(selectedWorkspace.id);
    setIsManagingWorkspace(false);

    if (result?.deleted) {
      setDeleteSafeguards(null);
      setDeleteConfirmationInput('');
      setIsDeleteWorkspaceModalOpen(false);
      return;
    }

    if (result?.requiresConfirmation) {
      setDeleteSafeguards(result.safeguards || null);
      return;
    }

    pushError(result?.error || 'Unable to delete workspace. Please try again.');
  };

  const showFull = isMobile || !isCollapsed;
  const containerClasses = isMobile
    ? `fixed top-0 left-0 z-[60] h-screen w-[280px] max-w-[85vw] flex flex-col border-r border-gray-200 bg-white shadow-xl transition-transform duration-300 ease-in-out md:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'
    }`
    : `fixed top-0 left-0 z-50 h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300 hidden md:flex ${isCollapsed ? 'w-[70px]' : 'w-[220px]'
    }`;

  const workspaceModal = isWorkspaceModalOpen ? (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 p-4"
      onClick={closeWorkspaceModal}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Create workspace"
        onClick={(event) => event.stopPropagation()}
        className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              New workspace
            </p>
            <h2 className="mt-1 text-xl font-semibold text-gray-900">
              How do you want to use Bucket?
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Pick a setup style, then name your workspace.
            </p>
          </div>
          <button
            type="button"
            onClick={closeWorkspaceModal}
            disabled={isCreatingWorkspace}
            className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50">
            <span className="sr-only">Close</span>
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="space-y-2">
            {WORKSPACE_TEMPLATES.map((workspaceTemplate) => {
              const isSelected =
                workspaceTemplate.id === selectedWorkspaceTemplateId;

              return (
                <button
                  key={workspaceTemplate.id}
                  type="button"
                  onClick={() => handleWorkspaceTemplateSelect(workspaceTemplate)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                    isSelected
                      ? 'border-gray-900 bg-gray-100'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2`}>
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border ${
                      isSelected ? 'border-gray-400 bg-white' : 'border-gray-200 bg-gray-50'
                    }`}>
                    {getWorkspaceTemplateIcon(workspaceTemplate.id)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {workspaceTemplate.title}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {workspaceTemplate.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white">
                {getWorkspaceTemplateIcon(selectedWorkspaceTemplate.id)}
              </div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {selectedWorkspaceTemplate.title}
              </p>
            </div>

            <label
              htmlFor="workspace-name-input"
              className="mt-3 block text-xs font-medium uppercase tracking-wide text-gray-500">
              Workspace name
            </label>
            <input
              id="workspace-name-input"
              type="text"
              value={newWorkspaceName}
              onChange={(event) => setNewWorkspaceName(event.target.value)}
              placeholder="Workspace name"
              className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
            <p className="mt-2 text-[11px] text-gray-500">
              This will show up in your sidebar workspace menu.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-5 py-4">
          <button
            type="button"
            onClick={closeWorkspaceModal}
            disabled={isCreatingWorkspace}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreateWorkspace}
            disabled={isCreatingWorkspace}
            className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400">
            {isCreatingWorkspace ? 'Creating...' : 'Create workspace'}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  const renameWorkspaceModal = isRenameWorkspaceModalOpen ? (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 p-4"
      onClick={closeRenameWorkspaceModal}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Rename workspace"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="border-b border-gray-200 px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Workspace settings
          </p>
          <h2 className="mt-1 text-lg font-semibold text-gray-900">
            Rename workspace
          </h2>
        </div>
        <div className="space-y-2 px-5 py-4">
          <label
            htmlFor="workspace-rename-input"
            className="block text-xs font-medium uppercase tracking-wide text-gray-500">
            Workspace name
          </label>
          <input
            id="workspace-rename-input"
            type="text"
            value={renamedWorkspaceName}
            onChange={(event) => setRenamedWorkspaceName(event.target.value)}
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
            placeholder="Workspace name"
          />
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-5 py-4">
          <button
            type="button"
            onClick={closeRenameWorkspaceModal}
            disabled={isManagingWorkspace}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleRenameWorkspace}
            disabled={isManagingWorkspace}
            className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400">
            {isManagingWorkspace ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  const requiresDeleteConfirmation = Boolean(deleteSafeguards?.workspaceName);
  const expectedDeleteConfirmation = deleteSafeguards?.workspaceName || '';
  const isDeleteConfirmInputValid =
    !requiresDeleteConfirmation ||
    deleteConfirmationInput.trim() === expectedDeleteConfirmation;
  let deleteActionLabel = 'Continue';
  if (requiresDeleteConfirmation) {
    deleteActionLabel = 'Delete permanently';
  }
  if (isManagingWorkspace) {
    deleteActionLabel = 'Deleting...';
  }
  const deleteWorkspaceModal = isDeleteWorkspaceModalOpen ? (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 p-4"
      onClick={closeDeleteWorkspaceModal}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Delete workspace"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="border-b border-gray-200 px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-red-600">
            Dangerous action
          </p>
          <h2 className="mt-1 text-lg font-semibold text-gray-900">
            Delete workspace
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            This action cannot be undone.
          </p>
        </div>
        <div className="space-y-3 px-5 py-4">
          {!requiresDeleteConfirmation && (
            <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
              We will check whether this workspace has active projects/tasks before deleting.
            </p>
          )}

          {requiresDeleteConfirmation && (
            <>
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                <strong>{deleteSafeguards?.activeProjects || 0}</strong> active projects and{' '}
                <strong>{deleteSafeguards?.activeTasks || 0}</strong> active tasks will be
                permanently deleted.
              </p>
              <label
                htmlFor="workspace-delete-confirm-input"
                className="block text-xs font-medium uppercase tracking-wide text-gray-500">
                Type <span className="font-semibold text-gray-800">{expectedDeleteConfirmation}</span>{' '}
                to confirm
              </label>
              <input
                id="workspace-delete-confirm-input"
                type="text"
                value={deleteConfirmationInput}
                onChange={(event) => setDeleteConfirmationInput(event.target.value)}
                className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                placeholder={expectedDeleteConfirmation}
              />
            </>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-5 py-4">
          <button
            type="button"
            onClick={closeDeleteWorkspaceModal}
            disabled={isManagingWorkspace}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDeleteWorkspace}
            disabled={isManagingWorkspace || !isDeleteConfirmInputValid}
            className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300">
            {deleteActionLabel}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <aside className={containerClasses} id={isMobile ? 'mobile-sidebar' : undefined}>
        <div
          className={`relative flex h-[var(--chrome-height)] items-center justify-between px-5 transition-all duration-300 ${
            isMobile ? 'border-b border-gray-200' : ''
          }`}>
        <div className="flex items-center gap-3">
          <Image
            src="/cat.gif"
            alt="logo"
            width={30}
            height={30}
            className="flex-shrink-0 rounded-full"
          />
          <div
            className={`overflow-hidden transition-all duration-300 ${showFull ? 'w-auto opacity-100' : 'w-0 opacity-0'
              }`}>
            <div className="flex flex-col">
              <h3 className="whitespace-nowrap text-lg font-bold leading-tight text-gray-900">
                BUCKET
              </h3>
              <span className="whitespace-nowrap text-xs leading-tight text-gray-500">
                project management
              </span>
            </div>
          </div>
        </div>
        {!isMobile && (
          <button
            onClick={onToggleCollapse}
            className="absolute -right-3 top-1/2 -translate-y-1/2 rounded-full border border-gray-200 bg-white p-1 shadow-sm hover:bg-gray-50">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className={`text-gray-500 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''
                }`}>
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        )}
        {isMobile && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="inline-flex h-9 w-9 items-center justify-center text-gray-500 transition hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-300">
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <div className="mb-2 px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
          {showFull && 'Navigation'}
        </div>

        <div className="space-y-1">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              className={`group flex items-center rounded-lg transition-colors hover:bg-gray-100 ${
                showFull
                  ? 'w-full gap-3 px-3 py-2 text-left'
                  : 'mx-auto h-9 w-9 justify-center'
              } ${activeItem === item.id
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-500 hover:text-gray-900'
                }`}
              onClick={() => handleItemClick(item.id)}>
              <span className="flex-shrink-0">{item.icon}</span>
              {showFull && (
                <>
                  <span className="text-sm font-medium flex-1">{item.label}</span>
                  {item.id === 'notifications' && unreadNotificationsCount > 0 && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700">
                      {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </div>
      </nav>

      <div className="h-[var(--footer-height-mobile)] bg-white md:h-[var(--footer-height)]">
        <div className="flex h-full items-center p-3">
          <div className="relative w-full" ref={workspaceMenuRef}>
            {isWorkspaceMenuOpen && (
              <div
                className={`absolute z-[70] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl ${
                  isMobile || !isCollapsed
                    ? 'bottom-[calc(100%+8px)] left-0 right-0'
                    : 'bottom-0 left-full ml-2 w-72'
                }`}>
                <div className="border-b border-gray-200 px-3 py-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Workspaces
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Select a workspace to scope your projects and notes.
                  </p>
                </div>

                <div className="max-h-64 overflow-y-auto p-2">
                  {isWorkspacesLoading && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500">
                      Loading workspaces...
                    </div>
                  )}

                  {!isWorkspacesLoading && workspaces.length === 0 && (
                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                      <div className="relative h-28 w-full">
                        <Image
                          src="/productive-cat.gif"
                          alt="Choose workspace"
                          fill
                          sizes="280px"
                          className="object-cover"
                        />
                      </div>
                      <p className="px-3 py-2 text-xs text-gray-600">
                        Create your first workspace to get started.
                      </p>
                    </div>
                  )}

                  {!isWorkspacesLoading && workspaces.length > 0 && (
                    <div className="space-y-1">
                      {workspaces.map((workspace) => {
                        const isSelected = workspace.id === selectedWorkspaceId;
                        return (
                          <button
                            key={workspace.id}
                            type="button"
                            onClick={() => {
                              setSelectedWorkspaceId(workspace.id);
                              setIsWorkspaceMenuOpen(false);
                            }}
                            className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors ${
                              isSelected
                                ? 'bg-gray-100 text-gray-900'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}>
                            <div className="relative h-6 w-6 overflow-hidden rounded-md border border-gray-200">
                              <Image
                                src={getWorkspaceGif(workspace.name)}
                                alt={workspace.name}
                                fill
                                sizes="24px"
                                className="object-cover"
                              />
                            </div>
                            <span className="flex-1 truncate text-sm">{workspace.name}</span>
                            {isSelected && (
                              <svg
                                className="h-4 w-4 text-gray-700"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round">
                                <path d="M4.5 12.75 10.5 18l9-13.5" />
                              </svg>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 p-2">
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsWorkspaceMenuOpen(false);
                        router.push('/workspaces/new');
                      }}
                      className="flex w-full items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50">
                      <span className="text-base leading-none">+</span>
                      Add workspace
                    </button>

                    {selectedWorkspace && (
                      <div className="grid grid-cols-2 gap-1">
                        <button
                          type="button"
                          onClick={openRenameWorkspaceModal}
                          className="rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50">
                          Rename
                        </button>
                        {workspaces.length > 1 && (
                          <button
                            type="button"
                            onClick={openDeleteWorkspaceModal}
                            className="rounded-lg border border-red-200 bg-red-50 px-2 py-2 text-xs font-medium text-red-700 hover:bg-red-100">
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsWorkspaceMenuOpen((current) => !current)}
              className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-left text-gray-700 transition hover:bg-gray-50">
              <div className="relative h-6 w-6 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                <Image
                  src={getWorkspaceGif(selectedWorkspace?.name)}
                  alt={selectedWorkspace?.name || 'Workspace'}
                  fill
                  sizes="24px"
                  className="object-cover"
                />
              </div>
              {showFull && (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs uppercase tracking-wide text-gray-500">
                      {(() => {
                        const firstWord = selectedWorkspace?.name?.trim().split(/\s+/)[0] || '';
                        return firstWord.length <= 5 ? 'Workspace' : 'Work';
                      })()}
                    </p>
                    <p className="truncate text-sm font-medium text-gray-900">
                      {selectedWorkspace?.name || 'Choose workspace'}
                    </p>
                  </div>
                  <svg
                    className={`h-4 w-4 text-gray-400 transition-transform ${
                      isWorkspaceMenuOpen ? 'rotate-180' : ''
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <path d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      </aside>
      {isClient && workspaceModal ? createPortal(workspaceModal, document.body) : null}
      {isClient && renameWorkspaceModal
        ? createPortal(renameWorkspaceModal, document.body)
        : null}
      {isClient && deleteWorkspaceModal
        ? createPortal(deleteWorkspaceModal, document.body)
        : null}
    </>
  );
}
