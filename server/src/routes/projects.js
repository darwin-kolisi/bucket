import express from 'express';
import { prisma } from '../lib/auth.js';
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

const normalizeStatusFilter = (value) => {
  if (!value) return '';
  return value
    .toString()
    .toLowerCase()
    .replace(/_/g, '-')
    .replace(/\s+/g, '-');
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
  const workspace =
    workspaceId || (await getDefaultWorkspace(req.user.id))?.id;

  if (!workspace) {
    return res.status(200).json({ projects: [] });
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

  const workspace =
    workspaceId || (await ensureWorkspace(req.user))?.id;

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
  const project = await prisma.project.findFirst({
    where: { id: req.params.id, deletedAt: null },
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
  const project = await prisma.project.update({
    where: { id: req.params.id },
    data: {
      name: name?.trim(),
      description: description?.trim(),
      dueDate: dueDate === null ? null : dueDate ? parseDateInput(dueDate) : undefined,
      startDate:
        startDate === null ? null : startDate ? parseDateInput(startDate) : undefined,
    },
  });
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
  await prisma.project.update({
    where: { id: req.params.id },
    data: { deletedAt: new Date() },
  });
  res.status(204).send();
});

router.post('/projects/:id/tasks', requireAuth, async (req, res) => {
  const { title, description, dueDate, assigneeId, status, order, priority, subtasks } =
    req.body || {};

  if (!title?.trim()) {
    return res.status(400).json({ error: 'Task title is required' });
  }

  const project = await prisma.project.findFirst({
    where: { id: req.params.id, deletedAt: null },
  });
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

  res.status(201).json({ task: toUiTask(task) });
});

router.patch('/tasks/:id', requireAuth, async (req, res) => {
  const { title, description, dueDate, assigneeId, status, order, priority, subtasks } =
    req.body || {};
  const existing = await prisma.task.findFirst({
    where: { id: req.params.id, deletedAt: null },
  });
  if (!existing) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const project = await prisma.project.findFirst({
    where: { id: existing.projectId, deletedAt: null },
  });
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
  res.json({ task: toUiTask(task) });
});

router.delete('/tasks/:id', requireAuth, async (req, res) => {
  await prisma.task.update({
    where: { id: req.params.id },
    data: { deletedAt: new Date() },
  });
  res.status(204).send();
});

router.get('/projects/:id/tasks', requireAuth, async (req, res) => {
  const tasks = await prisma.task.findMany({
    where: {
      projectId: req.params.id,
      deletedAt: null,
    },
    orderBy: { createdAt: 'asc' },
  });
  res.json({ tasks: tasks.map(toUiTask) });
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
