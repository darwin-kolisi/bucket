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
  if (Array.isArray(value)) return value;
  return [];
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
  const subtasks = parseSubtasks(task.subtasks);
  const total = 10;
  const progress = subtasks.length
    ? Math.round(
        (subtasks.filter((subtask) => subtask?.completed).length /
          subtasks.length) *
          total
      )
    : getProgressByStatus(task.status, total);

  return {
    ...task,
    status: toUiTaskStatus(task.status),
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
    const status = toDbTaskStatus(task.status) || task.status;
    return task.dueDate && status !== 'done' && task.dueDate < now;
  });
  if (hasOverdueTask) {
    return 'at_risk';
  }

  const allDone = tasks.every(
    (task) => (toDbTaskStatus(task.status) || task.status) === 'done'
  );
  if (allDone) {
    return 'completed';
  }

  const anyProgress = tasks.some((task) => {
    const status = toDbTaskStatus(task.status) || task.status;
    return status === 'in_progress' || status === 'in_review' || status === 'done';
  });
  return anyProgress ? 'on_track' : 'in_progress';
};

router.get('/projects', requireAuth, async (req, res) => {
  const workspaceId = req.query.workspaceId?.toString();
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
    const totalTasks = uiTasks.length;
    const completedTasks = project.tasks.filter(
      (task) => (toDbTaskStatus(task.status) || task.status) === 'done'
    ).length;
    return {
      ...project,
      tasks: uiTasks,
      status: computeProjectStatus(project),
      totalTasks,
      completedTasks,
    };
  });

  res.json({ projects: payload });
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
  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter(
    (task) => (toDbTaskStatus(task.status) || task.status) === 'done'
  ).length;
  res.json({
    project: {
      ...project,
      tasks: project.tasks.map(toUiTask),
      status: computeProjectStatus(project),
      totalTasks,
      completedTasks,
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

  const task = await prisma.task.create({
    data: {
      projectId: req.params.id,
      title: title.trim(),
      description: description?.trim() || null,
      dueDate: parseDateInput(dueDate),
      assigneeId: assigneeId || null,
      status: toDbTaskStatus(status) || 'todo',
      order: Number.isInteger(order) ? order : null,
      priority: priority || 'Medium',
      subtasks: Array.isArray(subtasks) ? subtasks : [],
    },
  });

  res.status(201).json({ task: toUiTask(task) });
});

router.patch('/tasks/:id', requireAuth, async (req, res) => {
  const { title, description, dueDate, assigneeId, status, order, priority, subtasks } =
    req.body || {};
  const task = await prisma.task.update({
    where: { id: req.params.id },
    data: {
      title: title?.trim(),
      description: description?.trim(),
      dueDate: dueDate === null ? null : dueDate ? parseDateInput(dueDate) : undefined,
      assigneeId: assigneeId === null ? null : assigneeId,
      status: toDbTaskStatus(status),
      order,
      priority,
      subtasks: Array.isArray(subtasks) ? subtasks : undefined,
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
