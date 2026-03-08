import express from 'express';
import { prisma } from '../lib/auth.js';
import { createWorkspaceNotifications } from '../lib/notifications.js';
import { requireAuth } from './utils.js';

const router = express.Router();

const getDefaultWorkspace = async (userId) => {
  const membership = await prisma.workspaceMember.findFirst({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    include: { workspace: true },
  });
  return membership?.workspace || null;
};

const ensureWorkspace = async (user) => {
  const existing = await getDefaultWorkspace(user.id);
  if (existing) {
    return existing;
  }
  const workspaceName = user?.name
    ? `${user.name.split(' ')[0] || 'Personal'} Workspace`
    : 'Personal Workspace';
  return prisma.workspace.create({
    data: {
      name: workspaceName,
      ownerId: user.id,
      members: {
        create: {
          userId: user.id,
          role: 'owner',
        },
      },
    },
  });
};

const hasWorkspaceAccess = async (workspaceId, userId) => {
  if (!workspaceId || !userId) return false;
  const membership = await prisma.workspaceMember.findFirst({
    where: { workspaceId, userId },
    select: { id: true },
  });
  return Boolean(membership);
};

const projectScopeWhere = (projectId, userId) => ({
  id: projectId,
  deletedAt: null,
  workspace: {
    members: {
      some: { userId },
    },
  },
});

const taskScopeWhere = (taskId, userId) => ({
  id: taskId,
  deletedAt: null,
  project: {
    deletedAt: null,
    workspace: {
      members: {
        some: { userId },
      },
    },
  },
});

const noteScopeWhere = (noteId, userId) => ({
  id: noteId,
  deletedAt: null,
  project: {
    deletedAt: null,
    workspace: {
      members: {
        some: { userId },
      },
    },
  },
});

const getAccessibleProject = async (projectId, userId, query = {}) =>
  prisma.project.findFirst({
    where: projectScopeWhere(projectId, userId),
    ...query,
  });

const getAccessibleTask = async (taskId, userId, query = {}) =>
  prisma.task.findFirst({
    where: taskScopeWhere(taskId, userId),
    ...query,
  });

const getAccessibleNote = async (noteId, userId, query = {}) =>
  prisma.note.findFirst({
    where: noteScopeWhere(noteId, userId),
    ...query,
  });

const toDbTaskStatus = (status) => {
  if (!status) return undefined;
  const normalized = status.toString().toLowerCase().replace(/-/g, '_');
  if (normalized === 'todo') return 'todo';
  if (normalized === 'in_progress') return 'in_progress';
  if (normalized === 'in_review') return 'in_review';
  if (normalized === 'done') return 'done';
  return undefined;
};

const toUiTaskStatus = (status) => status?.replace(/_/g, '-') || 'todo';

const parseSubtasks = (value) => {
  if (!value) return [];
  if (!Array.isArray(value)) return [];
  return value.map((subtask) => ({
    ...subtask,
    completed: Boolean(subtask?.completed),
  }));
};

const resolveTaskStatusAndSubtasks = (subtasksValue, statusValue) => {
  const subtasks = parseSubtasks(subtasksValue);
  const hasSubtasks = subtasks.length > 0;
  const normalizedStatus = toDbTaskStatus(statusValue) || statusValue || 'todo';

  if (!hasSubtasks) {
    return { status: normalizedStatus, subtasks };
  }

  const allCompleted = subtasks.every((subtask) => subtask.completed);

  if (normalizedStatus === 'done' && !allCompleted) {
    return {
      status: 'done',
      subtasks: subtasks.map((subtask) => ({
        ...subtask,
        completed: true,
      })),
    };
  }

  if (allCompleted) {
    return { status: 'done', subtasks };
  }

  return { status: normalizedStatus, subtasks };
};

const getTaskCompletionUnits = (task) => {
  const resolved = resolveTaskStatusAndSubtasks(task.subtasks, task.status);
  const subtasks = resolved.subtasks;
  if (subtasks.length === 0) {
    return {
      total: 1,
      completed: resolved.status === 'done' ? 1 : 0,
    };
  }
  const completed = subtasks.filter((subtask) => subtask.completed).length;
  return { total: subtasks.length, completed };
};

const parseDateInput = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }

  const [dayStr, monthStr, yearStr] = value.toString().split(' ');
  if (!dayStr || !monthStr || !yearStr) {
    return null;
  }

  const monthIndex = new Date(`${monthStr} 1, 2000`).getMonth();
  if (Number.isNaN(monthIndex)) {
    return null;
  }
  const day = Number.parseInt(dayStr, 10);
  const year = Number.parseInt(yearStr, 10);
  if (!Number.isInteger(day) || !Number.isInteger(year)) {
    return null;
  }

  return new Date(year, monthIndex, day);
};

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const actorLabel = (user) =>
  user?.name?.trim() || user?.email?.trim() || 'A teammate';

const toComparableDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

const isSameDateTime = (a, b) => {
  const left = toComparableDate(a);
  const right = toComparableDate(b);
  if (!left && !right) return true;
  if (!left || !right) return false;
  return left.getTime() === right.getTime();
};

const getDueDateState = (value) => {
  const dueDate = toComparableDate(value);
  if (!dueDate) return null;
  const now = new Date();
  const delta = dueDate.getTime() - now.getTime();
  if (delta < 0) return 'overdue';
  if (delta <= 24 * 60 * 60 * 1000) return 'due_soon';
  return null;
};

const formatTaskStatusLabel = (value) =>
  value
    ?.toString()
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase()) || 'To do';

const normalizeStatusFilter = (value) => {
  if (!value) return '';
  return value
    .toString()
    .toLowerCase()
    .replace(/_/g, '-')
    .replace(/\s+/g, '-');
};

const toOptionalTrimmedString = (value) => {
  if (value === undefined || value === null) return null;
  const trimmed = value.toString().trim();
  return trimmed || null;
};

const getProgressByStatus = (status, total = 10) => {
  switch (status) {
    case 'todo':
      return 0;
    case 'in_progress':
      return Math.round(total * 0.5);
    case 'in_review':
      return Math.round(total * 0.8);
    case 'done':
      return total;
    default:
      return 0;
  }
};

const toUiTask = (task) => {
  const resolved = resolveTaskStatusAndSubtasks(task.subtasks, task.status);
  const subtasks = resolved.subtasks;
  const total = 10;
  const progress = subtasks.length
    ? Math.round(
        (subtasks.filter((subtask) => subtask?.completed).length /
          subtasks.length) *
          total
      )
    : getProgressByStatus(resolved.status, total);

  return {
    ...task,
    status: toUiTaskStatus(resolved.status),
    subtitle: task.description || 'No description',
    date: formatDate(task.dueDate),
    priority: task.priority || 'Medium',
    subtasks,
    progress,
    total,
  };
};

const noteInclude = {
  project: { select: { id: true, name: true } },
  task: { select: { id: true, title: true, status: true } },
  createdBy: {
    select: { id: true, name: true, email: true, image: true },
  },
};

const toUiNote = (note) => ({
  ...note,
  task: note.task
    ? {
        ...note.task,
        status: toUiTaskStatus(note.task.status),
      }
    : null,
});

const computeProjectStatus = (project) => {
  const tasks = project.tasks || [];
  const now = new Date();

  if (!tasks.length) {
    return 'in_progress';
  }

  const hasOverdueTask = tasks.some((task) => {
    const status =
      resolveTaskStatusAndSubtasks(task.subtasks, task.status).status;
    return task.dueDate && status !== 'done' && task.dueDate < now;
  });
  if (hasOverdueTask) {
    return 'at_risk';
  }

  const allDone = tasks.every(
    (task) =>
      resolveTaskStatusAndSubtasks(task.subtasks, task.status).status === 'done'
  );
  if (allDone) {
    return 'completed';
  }

  const anyProgress = tasks.some((task) => {
    const status =
      resolveTaskStatusAndSubtasks(task.subtasks, task.status).status;
    return status === 'in_progress' || status === 'in_review' || status === 'done';
  });
  return anyProgress ? 'on_track' : 'in_progress';
};

router.get('/projects', requireAuth, async (req, res) => {
  const workspaceId = req.query.workspaceId?.toString();
  const searchQuery = req.query.q?.toString().trim().toLowerCase() || '';
  const statusFilter = normalizeStatusFilter(req.query.status);
  const sortOption = req.query.sort?.toString() || 'newest';
  const workspace = workspaceId || (await getDefaultWorkspace(req.user.id))?.id;

  if (!workspace) {
    return res.status(200).json({ projects: [] });
  }

  if (workspaceId) {
    const allowed = await hasWorkspaceAccess(workspaceId, req.user.id);
    if (!allowed) {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }

  const projects = await prisma.project.findMany({
    where: {
      workspaceId: workspace,
      deletedAt: null,
    },
    include: {
      tasks: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const payload = projects.map((project) => {
    const uiTasks = project.tasks.map(toUiTask);
    const totals = project.tasks.reduce(
      (acc, task) => {
        const units = getTaskCompletionUnits(task);
        acc.total += units.total;
        acc.completed += units.completed;
        return acc;
      },
      { total: 0, completed: 0 }
    );
    return {
      ...project,
      tasks: uiTasks,
      status: computeProjectStatus(project),
      totalTasks: totals.total,
      completedTasks: totals.completed,
    };
  });

  let filtered = payload;

  if (searchQuery) {
    filtered = filtered.filter((project) => {
      const nameMatch = project.name?.toLowerCase().includes(searchQuery);
      const descriptionMatch = project.description
        ?.toLowerCase()
        .includes(searchQuery);
      return nameMatch || descriptionMatch;
    });
  }

  if (statusFilter && statusFilter !== 'all') {
    filtered = filtered.filter((project) => {
      const normalizedStatus = normalizeStatusFilter(project.status);
      if (statusFilter === 'on-track') {
        return normalizedStatus === 'on-track' || normalizedStatus === 'in-progress';
      }
      return normalizedStatus === statusFilter;
    });
  }

  if (sortOption === 'oldest') {
    filtered = [...filtered].sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateA - dateB;
    });
  } else if (sortOption === 'due-soon') {
    filtered = [...filtered].sort((a, b) => {
      const dueA = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      const dueB = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      return dueA - dueB;
    });
  } else {
    filtered = [...filtered].sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateB - dateA;
    });
  }

  res.json({ projects: filtered });
});

router.post('/projects', requireAuth, async (req, res) => {
  const { name, description, dueDate, startDate, workspaceId } = req.body || {};
  if (!name?.trim()) {
    return res.status(400).json({ error: 'Project name is required' });
  }

  if (workspaceId) {
    const allowed = await hasWorkspaceAccess(workspaceId, req.user.id);
    if (!allowed) {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }

  const workspace = workspaceId || (await ensureWorkspace(req.user))?.id;

  const project = await prisma.project.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      dueDate: parseDateInput(dueDate),
      startDate: parseDateInput(startDate),
      workspaceId: workspace,
      createdById: req.user.id,
    },
  });

  const actor = actorLabel(req.user);
  await createWorkspaceNotifications({
    workspaceId: project.workspaceId,
    type: 'project_created',
    title: 'Project created',
    message: `${actor} created "${project.name}".`,
    priority: 'low',
    projectId: project.id,
  });

  const dueDateState = getDueDateState(project.dueDate);
  if (dueDateState === 'due_soon') {
    await createWorkspaceNotifications({
      workspaceId: project.workspaceId,
      type: 'project_due_soon',
      title: 'Project due soon',
      message: `"${project.name}" is due on ${formatDate(project.dueDate)}.`,
      priority: 'high',
      projectId: project.id,
    });
  } else if (dueDateState === 'overdue') {
    await createWorkspaceNotifications({
      workspaceId: project.workspaceId,
      type: 'project_overdue',
      title: 'Project overdue',
      message: `"${project.name}" is overdue since ${formatDate(project.dueDate)}.`,
      priority: 'high',
      projectId: project.id,
    });
  }

  res.status(201).json({
    project: {
      ...project,
      tasks: [],
      status: computeProjectStatus({ ...project, tasks: [] }),
      totalTasks: 0,
      completedTasks: 0,
    },
  });
});

router.get('/projects/:id', requireAuth, async (req, res) => {
  const project = await getAccessibleProject(req.params.id, req.user.id, {
    include: {
      tasks: { where: { deletedAt: null } },
    },
  });
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  const totals = project.tasks.reduce(
    (acc, task) => {
      const units = getTaskCompletionUnits(task);
      acc.total += units.total;
      acc.completed += units.completed;
      return acc;
    },
    { total: 0, completed: 0 }
  );
  res.json({
    project: {
      ...project,
      tasks: project.tasks.map(toUiTask),
      status: computeProjectStatus(project),
      totalTasks: totals.total,
      completedTasks: totals.completed,
    },
  });
});

router.patch('/projects/:id', requireAuth, async (req, res) => {
  const { name, description, dueDate, startDate } = req.body || {};
  const existingProject = await getAccessibleProject(req.params.id, req.user.id, {
    select: {
      id: true,
      name: true,
      dueDate: true,
      startDate: true,
      workspaceId: true,
    },
  });
  if (!existingProject) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const nextProjectDueDate =
    dueDate === null
      ? null
      : dueDate !== undefined
        ? parseDateInput(dueDate)
        : existingProject.dueDate;

  if (nextProjectDueDate) {
    const violatingTask = await prisma.task.findFirst({
      where: {
        projectId: existingProject.id,
        deletedAt: null,
        dueDate: { gt: nextProjectDueDate },
      },
      select: { id: true },
      orderBy: { dueDate: 'asc' },
    });

    if (violatingTask) {
      return res.status(400).json({
        error: 'Project due date cannot be earlier than active task due dates.',
      });
    }
  }

  const project = await prisma.project.update({
    where: { id: req.params.id },
    data: {
      name: name?.trim(),
      description: description?.trim(),
      dueDate:
        dueDate === null ? null : dueDate !== undefined ? nextProjectDueDate : undefined,
      startDate:
        startDate === null ? null : startDate ? parseDateInput(startDate) : undefined,
    },
  });

  const actor = actorLabel(req.user);
  const nameChanged =
    name !== undefined && name?.trim() && name.trim() !== existingProject.name;
  const dueDateChanged =
    dueDate !== undefined && !isSameDateTime(existingProject.dueDate, project.dueDate);
  const startDateChanged =
    startDate !== undefined &&
    !isSameDateTime(existingProject.startDate, project.startDate);
  const descriptionChanged = description !== undefined;

  if (nameChanged || dueDateChanged || startDateChanged || descriptionChanged) {
    await createWorkspaceNotifications({
      workspaceId: existingProject.workspaceId,
      type: 'project_updated',
      title: 'Project updated',
      message: `${actor} updated "${project.name}".`,
      priority: 'medium',
      projectId: project.id,
    });
  }

  if (dueDateChanged) {
    const dueDateState = getDueDateState(project.dueDate);
    if (dueDateState === 'due_soon') {
      await createWorkspaceNotifications({
        workspaceId: existingProject.workspaceId,
        type: 'project_due_soon',
        title: 'Project due soon',
        message: `"${project.name}" is due on ${formatDate(project.dueDate)}.`,
        priority: 'high',
        projectId: project.id,
      });
    } else if (dueDateState === 'overdue') {
      await createWorkspaceNotifications({
        workspaceId: existingProject.workspaceId,
        type: 'project_overdue',
        title: 'Project overdue',
        message: `"${project.name}" is overdue since ${formatDate(project.dueDate)}.`,
        priority: 'high',
        projectId: project.id,
      });
    }
  }

  res.json({
    project: {
      ...project,
      status: computeProjectStatus({ ...project, tasks: [] }),
      totalTasks: 0,
      completedTasks: 0,
    },
  });
});

router.delete('/projects/:id', requireAuth, async (req, res) => {
  const existingProject = await getAccessibleProject(req.params.id, req.user.id, {
    select: { id: true, name: true, workspaceId: true },
  });
  if (!existingProject) {
    return res.status(404).json({ error: 'Project not found' });
  }

  await prisma.project.update({
    where: { id: req.params.id },
    data: { deletedAt: new Date() },
  });

  await createWorkspaceNotifications({
    workspaceId: existingProject.workspaceId,
    type: 'project_deleted',
    title: 'Project deleted',
    message: `${actorLabel(req.user)} removed "${existingProject.name}".`,
    priority: 'medium',
    projectId: existingProject.id,
  });

  res.status(204).send();
});

router.post('/projects/:id/tasks', requireAuth, async (req, res) => {
  const { title, description, dueDate, assigneeId, status, order, priority, subtasks } =
    req.body || {};

  if (!title?.trim()) {
    return res.status(400).json({ error: 'Task title is required' });
  }

  const project = await getAccessibleProject(req.params.id, req.user.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const parsedDueDate = dueDate ? parseDateInput(dueDate) : null;
  if (parsedDueDate && project.dueDate && parsedDueDate > project.dueDate) {
    return res.status(400).json({
      error: 'Task due date cannot be after the project due date.',
    });
  }

  const resolved = resolveTaskStatusAndSubtasks(subtasks, status);

  const task = await prisma.task.create({
    data: {
      projectId: req.params.id,
      title: title.trim(),
      description: description?.trim() || null,
      dueDate: parseDateInput(dueDate),
      assigneeId: assigneeId || null,
      status: resolved.status,
      order: Number.isInteger(order) ? order : null,
      priority: priority || 'Medium',
      subtasks: resolved.subtasks,
    },
  });

  const actor = actorLabel(req.user);
  await createWorkspaceNotifications({
    workspaceId: project.workspaceId,
    type: 'task_created',
    title: 'Task created',
    message: `${actor} added "${task.title}" to "${project.name}".`,
    priority: 'medium',
    projectId: project.id,
    taskId: task.id,
  });

  const dueDateState = getDueDateState(task.dueDate);
  if (dueDateState === 'due_soon') {
    await createWorkspaceNotifications({
      workspaceId: project.workspaceId,
      type: 'task_due_soon',
      title: 'Task due soon',
      message: `"${task.title}" is due on ${formatDate(task.dueDate)}.`,
      priority: 'high',
      projectId: project.id,
      taskId: task.id,
    });
  } else if (dueDateState === 'overdue') {
    await createWorkspaceNotifications({
      workspaceId: project.workspaceId,
      type: 'task_overdue',
      title: 'Task overdue',
      message: `"${task.title}" is overdue since ${formatDate(task.dueDate)}.`,
      priority: 'high',
      projectId: project.id,
      taskId: task.id,
    });
  }

  res.status(201).json({ task: toUiTask(task) });
});

router.patch('/tasks/:id', requireAuth, async (req, res) => {
  const { title, description, dueDate, assigneeId, status, order, priority, subtasks } =
    req.body || {};
  const existing = await getAccessibleTask(req.params.id, req.user.id);
  if (!existing) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const project = await getAccessibleProject(existing.projectId, req.user.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const nextDueDate =
    dueDate === null
      ? null
      : dueDate !== undefined
        ? parseDateInput(dueDate)
        : existing.dueDate;

  if (nextDueDate && project.dueDate && nextDueDate > project.dueDate) {
    return res.status(400).json({
      error: 'Task due date cannot be after the project due date.',
    });
  }

  const incomingSubtasks = subtasks !== undefined ? subtasks : existing.subtasks;
  const incomingStatus = status !== undefined ? status : existing.status;
  const resolved = resolveTaskStatusAndSubtasks(incomingSubtasks, incomingStatus);

  const task = await prisma.task.update({
    where: { id: req.params.id },
    data: {
      title: title?.trim(),
      description: description?.trim(),
      dueDate: dueDate === null ? null : dueDate ? parseDateInput(dueDate) : undefined,
      assigneeId: assigneeId === null ? null : assigneeId,
      status: resolved.status,
      order,
      priority,
      subtasks: resolved.subtasks,
    },
  });

  const actor = actorLabel(req.user);
  const statusChanged = existing.status !== task.status;
  const dueDateChanged = !isSameDateTime(existing.dueDate, task.dueDate);
  const titleChanged =
    title !== undefined && title?.trim() && title.trim() !== existing.title;
  const descriptionChanged = description !== undefined;
  const priorityChanged = priority !== undefined && priority !== existing.priority;

  if (statusChanged) {
    const completed = task.status === 'done';
    await createWorkspaceNotifications({
      workspaceId: project.workspaceId,
      type: completed ? 'task_completed' : 'task_status_updated',
      title: completed ? 'Task completed' : 'Task status updated',
      message: completed
        ? `${actor} marked "${task.title}" as done.`
        : `${actor} moved "${task.title}" to ${formatTaskStatusLabel(task.status)}.`,
      priority: completed ? 'medium' : 'low',
      projectId: project.id,
      taskId: task.id,
    });
  }

  if (dueDateChanged) {
    const dueDateState = getDueDateState(task.dueDate);
    if (dueDateState === 'due_soon') {
      await createWorkspaceNotifications({
        workspaceId: project.workspaceId,
        type: 'task_due_soon',
        title: 'Task due soon',
        message: `"${task.title}" is due on ${formatDate(task.dueDate)}.`,
        priority: 'high',
        projectId: project.id,
        taskId: task.id,
      });
    } else if (dueDateState === 'overdue') {
      await createWorkspaceNotifications({
        workspaceId: project.workspaceId,
        type: 'task_overdue',
        title: 'Task overdue',
        message: `"${task.title}" is overdue since ${formatDate(task.dueDate)}.`,
        priority: 'high',
        projectId: project.id,
        taskId: task.id,
      });
    } else if (task.dueDate) {
      await createWorkspaceNotifications({
        workspaceId: project.workspaceId,
        type: 'task_due_date_updated',
        title: 'Task due date updated',
        message: `${actor} updated "${task.title}" due date to ${formatDate(task.dueDate)}.`,
        priority: 'medium',
        projectId: project.id,
        taskId: task.id,
      });
    }
  }

  if (!statusChanged && !dueDateChanged && (titleChanged || descriptionChanged || priorityChanged)) {
    await createWorkspaceNotifications({
      workspaceId: project.workspaceId,
      type: 'task_updated',
      title: 'Task updated',
      message: `${actor} updated "${task.title}".`,
      priority: 'low',
      projectId: project.id,
      taskId: task.id,
    });
  }

  res.json({ task: toUiTask(task) });
});

router.delete('/tasks/:id', requireAuth, async (req, res) => {
  const existing = await getAccessibleTask(req.params.id, req.user.id, {
    select: {
      id: true,
      title: true,
      project: {
        select: {
          id: true,
          name: true,
          workspaceId: true,
        },
      },
    },
  });
  if (!existing) {
    return res.status(404).json({ error: 'Task not found' });
  }

  await prisma.task.update({
    where: { id: req.params.id },
    data: { deletedAt: new Date() },
  });

  await createWorkspaceNotifications({
    workspaceId: existing.project.workspaceId,
    type: 'task_deleted',
    title: 'Task deleted',
    message: `${actorLabel(req.user)} removed "${existing.title}" from "${existing.project.name}".`,
    priority: 'medium',
    projectId: existing.project.id,
    taskId: existing.id,
  });

  res.status(204).send();
});

router.get('/projects/:id/tasks', requireAuth, async (req, res) => {
  const project = await getAccessibleProject(req.params.id, req.user.id, {
    select: { id: true },
  });
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const tasks = await prisma.task.findMany({
    where: {
      projectId: req.params.id,
      deletedAt: null,
    },
    orderBy: { createdAt: 'asc' },
  });
  res.json({ tasks: tasks.map(toUiTask) });
});

router.get('/notes', requireAuth, async (req, res) => {
  const workspaceId = toOptionalTrimmedString(req.query.workspaceId);
  const projectId = toOptionalTrimmedString(req.query.projectId);
  const taskId = toOptionalTrimmedString(req.query.taskId);
  const searchQuery = toOptionalTrimmedString(req.query.q);

  if (workspaceId) {
    const allowed = await hasWorkspaceAccess(workspaceId, req.user.id);
    if (!allowed) {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }

  if (projectId) {
    const project = await getAccessibleProject(projectId, req.user.id, {
      select: { id: true },
    });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
  }

  if (taskId) {
    const task = await getAccessibleTask(taskId, req.user.id, {
      select: { id: true, projectId: true },
    });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    if (projectId && task.projectId !== projectId) {
      return res.status(400).json({
        error: 'Task does not belong to the selected project.',
      });
    }
  }

  const notes = await prisma.note.findMany({
    where: {
      deletedAt: null,
      ...(projectId ? { projectId } : {}),
      ...(taskId ? { taskId } : {}),
      project: {
        deletedAt: null,
        ...(workspaceId ? { workspaceId } : {}),
        workspace: {
          members: {
            some: { userId: req.user.id },
          },
        },
      },
      ...(searchQuery
        ? {
            OR: [
              { title: { contains: searchQuery, mode: 'insensitive' } },
              { content: { contains: searchQuery, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: noteInclude,
    orderBy: { updatedAt: 'desc' },
  });

  res.json({ notes: notes.map(toUiNote) });
});

router.post('/notes', requireAuth, async (req, res) => {
  const projectId = toOptionalTrimmedString(req.body?.projectId);
  const taskId = toOptionalTrimmedString(req.body?.taskId);
  const title = toOptionalTrimmedString(req.body?.title);
  const content = toOptionalTrimmedString(req.body?.content);

  if (!projectId) {
    return res.status(400).json({ error: 'Project is required.' });
  }
  if (!content) {
    return res.status(400).json({ error: 'Note content is required.' });
  }

  const project = await getAccessibleProject(projectId, req.user.id, {
    select: { id: true, name: true, workspaceId: true },
  });
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  let resolvedTaskId = null;
  let resolvedTaskTitle = null;
  if (taskId) {
    const task = await getAccessibleTask(taskId, req.user.id, {
      select: { id: true, projectId: true, title: true },
    });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    if (task.projectId !== projectId) {
      return res.status(400).json({
        error: 'Task does not belong to the selected project.',
      });
    }
    resolvedTaskId = task.id;
    resolvedTaskTitle = task.title;
  }

  const note = await prisma.note.create({
    data: {
      projectId,
      taskId: resolvedTaskId,
      title,
      content,
      createdById: req.user.id,
    },
    include: noteInclude,
  });

  await createWorkspaceNotifications({
    workspaceId: project.workspaceId,
    type: 'note_created',
    title: 'Note added',
    message: resolvedTaskTitle
      ? `${actorLabel(req.user)} added a note to "${resolvedTaskTitle}".`
      : `${actorLabel(req.user)} added a note in "${project.name}".`,
    priority: 'low',
    projectId: project.id,
    taskId: resolvedTaskId,
    noteId: note.id,
  });

  res.status(201).json({ note: toUiNote(note) });
});

router.patch('/notes/:id', requireAuth, async (req, res) => {
  const existingNote = await getAccessibleNote(req.params.id, req.user.id, {
    select: {
      id: true,
      title: true,
      projectId: true,
      taskId: true,
      project: {
        select: {
          id: true,
          name: true,
          workspaceId: true,
        },
      },
      task: {
        select: { id: true, title: true },
      },
    },
  });
  if (!existingNote) {
    return res.status(404).json({ error: 'Note not found' });
  }

  const nextTitle =
    req.body?.title !== undefined ? toOptionalTrimmedString(req.body?.title) : undefined;
  const nextContent =
    req.body?.content !== undefined
      ? toOptionalTrimmedString(req.body?.content)
      : undefined;
  const incomingTaskIdProvided = req.body?.taskId !== undefined;
  const incomingTaskId = incomingTaskIdProvided
    ? toOptionalTrimmedString(req.body?.taskId)
    : undefined;

  if (req.body?.content !== undefined && !nextContent) {
    return res.status(400).json({ error: 'Note content is required.' });
  }

  let nextTaskId = existingNote.taskId;
  if (incomingTaskIdProvided) {
    if (!incomingTaskId) {
      nextTaskId = null;
    } else {
      const task = await getAccessibleTask(incomingTaskId, req.user.id, {
        select: { id: true, projectId: true, title: true },
      });
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      if (task.projectId !== existingNote.projectId) {
        return res.status(400).json({
          error: 'Task does not belong to the selected project.',
        });
      }
      nextTaskId = task.id;
    }
  }

  const data = {
    ...(nextTitle !== undefined ? { title: nextTitle } : {}),
    ...(nextContent !== undefined ? { content: nextContent } : {}),
    ...(incomingTaskIdProvided ? { taskId: nextTaskId } : {}),
  };

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ error: 'No valid updates provided.' });
  }

  const note = await prisma.note.update({
    where: { id: req.params.id },
    data,
    include: noteInclude,
  });

  const changedTaskReference = incomingTaskIdProvided && nextTaskId !== existingNote.taskId;
  const changedTitle = nextTitle !== undefined && nextTitle !== existingNote.title;
  const changedContent = nextContent !== undefined;
  if (changedTaskReference || changedTitle || changedContent) {
    const targetTask = note.task?.title || existingNote.task?.title || null;
    await createWorkspaceNotifications({
      workspaceId: existingNote.project.workspaceId,
      type: 'note_updated',
      title: 'Note updated',
      message: targetTask
        ? `${actorLabel(req.user)} updated a note on "${targetTask}".`
        : `${actorLabel(req.user)} updated a note in "${existingNote.project.name}".`,
      priority: 'low',
      projectId: existingNote.project.id,
      taskId: note.taskId,
      noteId: note.id,
    });
  }

  res.json({ note: toUiNote(note) });
});

router.delete('/notes/:id', requireAuth, async (req, res) => {
  const existing = await getAccessibleNote(req.params.id, req.user.id, {
    select: {
      id: true,
      title: true,
      project: {
        select: {
          id: true,
          name: true,
          workspaceId: true,
        },
      },
      task: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });
  if (!existing) {
    return res.status(404).json({ error: 'Note not found' });
  }

  await prisma.note.update({
    where: { id: req.params.id },
    data: { deletedAt: new Date() },
  });

  await createWorkspaceNotifications({
    workspaceId: existing.project.workspaceId,
    type: 'note_deleted',
    title: 'Note deleted',
    message: existing.task?.title
      ? `${actorLabel(req.user)} removed a note from "${existing.task.title}".`
      : `${actorLabel(req.user)} removed a note from "${existing.project.name}".`,
    priority: 'low',
    projectId: existing.project.id,
    taskId: existing.task?.id || null,
    noteId: existing.id,
  });

  res.status(204).send();
});

router.get('/workspaces', requireAuth, async (req, res) => {
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId: req.user.id },
    include: { workspace: true },
    orderBy: { createdAt: 'asc' },
  });
  const workspaces = memberships.map((member) => member.workspace);
  res.json({ workspaces });
});

router.post('/workspaces', requireAuth, async (req, res) => {
  const { name } = req.body || {};
  if (!name?.trim()) {
    return res.status(400).json({ error: 'Workspace name is required' });
  }
  const workspace = await prisma.workspace.create({
    data: {
      name: name.trim(),
      ownerId: req.user.id,
      members: {
        create: { userId: req.user.id, role: 'owner' },
      },
    },
  });
  res.status(201).json({ workspace });
});

export default router;
