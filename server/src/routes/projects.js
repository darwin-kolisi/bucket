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

const computeProjectStatus = (project) => {
  const tasks = project.tasks || [];
  const now = new Date();

  if (!tasks.length) {
    return 'in_progress';
  }

  const hasOverdueTask = tasks.some(
    (task) => task.dueDate && task.status !== 'done' && task.dueDate < now
  );
  if (hasOverdueTask) {
    return 'at_risk';
  }

  const allDone = tasks.every((task) => task.status === 'done');
  if (allDone) {
    return 'completed';
  }

  const anyDone = tasks.some((task) => task.status === 'done');
  return anyDone ? 'on_track' : 'in_progress';
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
    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(
      (task) => task.status === 'done'
    ).length;
    return {
      ...project,
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
      dueDate: dueDate ? new Date(dueDate) : null,
      startDate: startDate ? new Date(startDate) : null,
      workspaceId: workspace,
      createdById: req.user.id,
    },
  });

  res.status(201).json({
    project: {
      ...project,
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
    (task) => task.status === 'done'
  ).length;
  res.json({
    project: {
      ...project,
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
      dueDate: dueDate ? new Date(dueDate) : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
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
  const { title, description, dueDate, assigneeId, status, order } =
    req.body || {};

  if (!title?.trim()) {
    return res.status(400).json({ error: 'Task title is required' });
  }

  const task = await prisma.task.create({
    data: {
      projectId: req.params.id,
      title: title.trim(),
      description: description?.trim() || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      assigneeId: assigneeId || null,
      status: status || 'todo',
      order: Number.isInteger(order) ? order : null,
    },
  });

  res.status(201).json({ task });
});

router.patch('/tasks/:id', requireAuth, async (req, res) => {
  const { title, description, dueDate, assigneeId, status, order } =
    req.body || {};
  const task = await prisma.task.update({
    where: { id: req.params.id },
    data: {
      title: title?.trim(),
      description: description?.trim(),
      dueDate: dueDate ? new Date(dueDate) : undefined,
      assigneeId: assigneeId === null ? null : assigneeId,
      status,
      order,
    },
  });
  res.json({ task });
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
