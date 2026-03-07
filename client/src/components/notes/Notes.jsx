'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useErrorToast } from '@/components/ui/ErrorToastProvider';
import AppSelect from '@/components/ui/AppSelect';

const formatDateTime = (value) => {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed);
};

const formatTaskStatus = (value) => {
  if (!value) return 'To do';
  return value
    .toString()
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const readApiError = async (response, fallbackMessage) => {
  let message = fallbackMessage;
  try {
    const payload = await response.json();
    if (typeof payload?.error === 'string' && payload.error.trim()) {
      message = payload.error;
    }
  } catch (error) {
    // ignore malformed payloads
  }
  return message;
};

export default function Notes() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { pushError } = useErrorToast();

  const urlProjectId = searchParams.get('projectId') || '';
  const urlTaskId = searchParams.get('taskId') || '';

  const [projects, setProjects] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(urlProjectId);
  const [selectedTaskId, setSelectedTaskId] = useState(urlTaskId);
  const [selectedNoteId, setSelectedNoteId] = useState('');
  const [notePendingDeleteId, setNotePendingDeleteId] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');

  const [editingNoteId, setEditingNoteId] = useState('');
  const [editingTitle, setEditingTitle] = useState('');
  const [editingContent, setEditingContent] = useState('');

  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savingEditId, setSavingEditId] = useState('');
  const [deletingId, setDeletingId] = useState('');
  const [hasLoadedProjects, setHasLoadedProjects] = useState(false);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );

  const selectedProjectTasks = useMemo(() => {
    if (!selectedProject?.tasks || !Array.isArray(selectedProject.tasks)) {
      return [];
    }
    return selectedProject.tasks;
  }, [selectedProject]);

  const selectedNote = useMemo(
    () => notes.find((note) => note.id === selectedNoteId) || null,
    [notes, selectedNoteId]
  );

  const projectSelectOptions = useMemo(
    () => [
      { label: 'All projects', value: '' },
      ...projects.map((project) => ({
        label: project.name,
        value: project.id,
      })),
    ],
    [projects]
  );

  const taskSelectOptions = useMemo(
    () => [
      { label: 'All tasks', value: '' },
      ...selectedProjectTasks.map((task) => ({
        label: task.title,
        value: task.id,
      })),
    ],
    [selectedProjectTasks]
  );

  useEffect(() => {
    setSelectedProjectId(urlProjectId);
    setSelectedTaskId(urlTaskId);
  }, [urlProjectId, urlTaskId]);

  useEffect(() => {
    if (!hasLoadedProjects) return;

    if (selectedProjectId && !projects.some((project) => project.id === selectedProjectId)) {
      setSelectedProjectId('');
      setSelectedTaskId('');
      return;
    }

    if (!selectedProjectId && selectedTaskId) {
      setSelectedTaskId('');
      return;
    }

    if (selectedTaskId && !selectedProjectTasks.some((task) => task.id === selectedTaskId)) {
      setSelectedTaskId('');
    }
  }, [
    hasLoadedProjects,
    projects,
    selectedProjectId,
    selectedTaskId,
    selectedProjectTasks,
  ]);

  useEffect(() => {
    if (!selectedNoteId) return;
    if (!notes.some((note) => note.id === selectedNoteId)) {
      setSelectedNoteId('');
    }
  }, [notes, selectedNoteId]);

  useEffect(() => {
    const currentProjectId = searchParams.get('projectId') || '';
    const currentTaskId = searchParams.get('taskId') || '';

    if (
      currentProjectId === selectedProjectId &&
      currentTaskId === selectedTaskId
    ) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    if (selectedProjectId) {
      params.set('projectId', selectedProjectId);
    } else {
      params.delete('projectId');
    }

    if (selectedTaskId) {
      params.set('taskId', selectedTaskId);
    } else {
      params.delete('taskId');
    }

    const query = params.toString();
    const nextUrl = query ? `${pathname}?${query}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }, [pathname, router, searchParams, selectedProjectId, selectedTaskId]);

  const fetchProjects = useCallback(async () => {
    setIsLoadingProjects(true);
    try {
      const response = await fetch(`${apiBase}/api/projects`, {
        credentials: 'include',
      });

      if (!response.ok) {
        setProjects([]);
        return;
      }

      const data = await response.json();
      setProjects(Array.isArray(data?.projects) ? data.projects : []);
    } catch (requestError) {
      setProjects([]);
    } finally {
      setIsLoadingProjects(false);
      setHasLoadedProjects(true);
    }
  }, [apiBase]);

  const fetchNotes = useCallback(async () => {
    setIsLoadingNotes(true);
    try {
      const params = new URLSearchParams();
      if (selectedProjectId) {
        params.set('projectId', selectedProjectId);
      }
      if (selectedTaskId) {
        params.set('taskId', selectedTaskId);
      }
      if (searchQuery.trim()) {
        params.set('q', searchQuery.trim());
      }

      const query = params.toString();
      const response = await fetch(`${apiBase}/api/notes${query ? `?${query}` : ''}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const message = await readApiError(response, 'Failed to load notes.');
        pushError(message);
        setNotes([]);
        return;
      }

      const data = await response.json();
      setNotes(Array.isArray(data?.notes) ? data.notes : []);
    } catch (requestError) {
      setNotes([]);
      pushError('Failed to load notes.');
    } finally {
      setIsLoadingNotes(false);
    }
  }, [apiBase, selectedProjectId, selectedTaskId, searchQuery, pushError]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleProjectChange = (value) => {
    setSelectedProjectId(value);
    setSelectedTaskId('');
  };

  const createNote = async (event) => {
    event.preventDefault();

    const trimmedTitle = draftTitle.trim();
    const trimmedContent = draftContent.trim();

    if (!selectedProjectId) {
      pushError('Choose a project before adding a note.');
      return;
    }

    if (!trimmedContent) {
      pushError('Content is required.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${apiBase}/api/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: trimmedTitle || null,
          content: trimmedContent,
          projectId: selectedProjectId,
          taskId: selectedTaskId || null,
        }),
      });

      if (!response.ok) {
        const message = await readApiError(response, 'Failed to create note.');
        pushError(message);
        return;
      }

      const { note } = await response.json();
      setNotes((prev) => [note, ...prev]);
      setSelectedNoteId(note.id);
      setDraftTitle('');
      setDraftContent('');
    } catch (requestError) {
      pushError('Unable to create note. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const beginEdit = (note) => {
    setEditingNoteId(note.id);
    setEditingTitle(note.title || '');
    setEditingContent(note.content || '');
  };

  const cancelEdit = () => {
    setEditingNoteId('');
    setEditingTitle('');
    setEditingContent('');
  };

  const saveEdit = async (noteId) => {
    const trimmedTitle = editingTitle.trim();
    const trimmedContent = editingContent.trim();

    if (!trimmedContent) {
      pushError('Content is required.');
      return;
    }

    setSavingEditId(noteId);
    try {
      const response = await fetch(`${apiBase}/api/notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: trimmedTitle || null,
          content: trimmedContent,
        }),
      });

      if (!response.ok) {
        const message = await readApiError(response, 'Failed to update note.');
        pushError(message);
        return;
      }

      const { note } = await response.json();
      setNotes((prev) =>
        prev.map((existingNote) =>
          existingNote.id === noteId ? note : existingNote
        )
      );

      cancelEdit();
    } catch (requestError) {
      pushError('Unable to update note. Please try again.');
    } finally {
      setSavingEditId('');
    }
  };

  const toggleDeletePrompt = (noteId) => {
    setNotePendingDeleteId((current) => (current === noteId ? '' : noteId));
  };

  const deleteNote = async (noteId) => {
    if (!noteId) return;

    setDeletingId(noteId);
    try {
      const response = await fetch(`${apiBase}/api/notes/${noteId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const message = await readApiError(response, 'Failed to delete note.');
        pushError(message);
        return;
      }

      setNotes((prev) => prev.filter((note) => note.id !== noteId));
      if (selectedNoteId === noteId) {
        setSelectedNoteId('');
      }
      setNotePendingDeleteId('');
    } catch (requestError) {
      pushError('Unable to delete note. Please try again.');
    } finally {
      setDeletingId('');
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] p-6">
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">Filters</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500">
              Project
            </label>
            <AppSelect
              value={selectedProjectId}
              onChange={handleProjectChange}
              options={projectSelectOptions}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500">
              Task
            </label>
            <AppSelect
              value={selectedTaskId}
              onChange={setSelectedTaskId}
              options={taskSelectOptions}
              disabled={!selectedProjectId}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500">
              Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search notes"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <form
          onSubmit={createNote}
          className="self-start rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">New Note</h2>
            <span className="rounded bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
              {selectedTaskId ? 'Task' : selectedProjectId ? 'Project' : 'Select project'}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500">
                Title
              </label>
              <input
                type="text"
                value={draftTitle}
                onChange={(event) => setDraftTitle(event.target.value)}
                placeholder="Sprint summary"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500">
                Content
              </label>
              <textarea
                value={draftContent}
                onChange={(event) => setDraftContent(event.target.value)}
                placeholder="Capture blockers, decisions, or handover notes"
                rows={7}
                className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50">
              {isSaving ? 'Saving...' : 'Add Note'}
            </button>
          </div>
        </form>

        <div className="self-start grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Notes</h2>
              <span className="rounded bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                {notes.length} {notes.length === 1 ? 'note' : 'notes'}
              </span>
            </div>

            {(isLoadingProjects || isLoadingNotes) && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                Loading...
              </div>
            )}

            {!isLoadingProjects && !isLoadingNotes && notes.length === 0 && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
                <p className="text-sm font-medium text-gray-700">No notes yet</p>
                <p className="mt-1 text-xs text-gray-500">Add your first note above</p>
              </div>
            )}

            {!isLoadingProjects && !isLoadingNotes && notes.length > 0 && (
              <div className="space-y-3">
                {notes.map((note) => {
                  const isEditing = editingNoteId === note.id;
                  const isBusy = savingEditId === note.id || deletingId === note.id;
                  const isSelected = selectedNoteId === note.id;
                  const isPendingDelete = notePendingDeleteId === note.id;

                  return (
                    <div
                      key={note.id}
                      className={`rounded-lg border bg-white p-4 transition ${
                        isSelected ? 'border-gray-900' : 'border-gray-200'
                      }`}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
                            <span className="rounded bg-gray-100 px-2 py-0.5 font-medium text-gray-700">
                              {note.project?.name || 'Unknown project'}
                            </span>
                            {note.task && (
                              <span className="rounded bg-blue-50 px-2 py-0.5 font-medium text-blue-700">
                                {note.task.title} · {formatTaskStatus(note.task.status)}
                              </span>
                            )}
                            <span>{formatDateTime(note.updatedAt)}</span>
                          </div>

                          {!isEditing && (
                            <>
                              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                                {note.title || 'Untitled note'}
                              </h3>
                              <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-sm text-gray-600">
                                {note.content}
                              </p>
                            </>
                          )}
                        </div>

                        {!isEditing && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => beginEdit(note)}
                              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleDeletePrompt(note.id)}
                              className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                                isPendingDelete
                                  ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                  : 'border-red-200 text-red-600 hover:bg-red-50'
                              }`}>
                              {isPendingDelete ? 'Cancel' : 'Delete'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedNoteId(note.id)}
                              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
                              View more
                            </button>
                          </div>
                        )}
                      </div>

                      {isEditing && (
                        <div className="mt-3 space-y-3">
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(event) => setEditingTitle(event.target.value)}
                            placeholder="Title"
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                          />
                          <textarea
                            value={editingContent}
                            onChange={(event) => setEditingContent(event.target.value)}
                            rows={5}
                            className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => saveEdit(note.id)}
                              disabled={isBusy}
                              className="rounded-lg bg-gray-900 px-4 py-2 text-xs font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50">
                              {savingEditId === note.id ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50">
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {isPendingDelete && !isEditing && (
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                          <p className="text-xs font-medium text-red-800">
                            Delete this note permanently?
                          </p>
                          <button
                            type="button"
                            onClick={() => deleteNote(note.id)}
                            disabled={deletingId === note.id}
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">
                            {deletingId === note.id ? 'Deleting...' : 'Confirm delete'}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 xl:sticky xl:top-6 xl:self-start">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Note details</h2>
              {selectedNote && (
                <button
                  type="button"
                  onClick={() => setSelectedNoteId('')}
                  className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50">
                  Clear
                </button>
              )}
            </div>

            {!selectedNote && (
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-500">
                Select a note and click "View more" to inspect it here.
              </div>
            )}

            {selectedNote && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    {selectedNote.title || 'Untitled note'}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
                    <span className="rounded bg-gray-100 px-2 py-0.5 font-medium text-gray-700">
                      {selectedNote.project?.name || 'Unknown project'}
                    </span>
                    {selectedNote.task && (
                      <span className="rounded bg-blue-50 px-2 py-0.5 font-medium text-blue-700">
                        {selectedNote.task.title} · {formatTaskStatus(selectedNote.task.status)}
                      </span>
                    )}
                    <span>{formatDateTime(selectedNote.updatedAt)}</span>
                  </div>
                </div>

                <div className="max-h-[360px] overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="whitespace-pre-wrap text-sm text-gray-700">
                    {selectedNote.content}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => beginEdit(selectedNote)}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
                    Edit note
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleDeletePrompt(selectedNote.id)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50">
                    Delete note
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
