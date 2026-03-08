import express from 'express';
import { prisma } from '../lib/auth.js';
import {
  notificationInclude,
  toApiNotification,
  publishNotificationUpdated,
  publishNotificationsReadAll,
  publishNotificationDeleted,
  registerNotificationStream,
} from '../lib/notifications.js';
import { requireAuth } from './utils.js';

const router = express.Router();

const parseLimit = (rawValue) => {
  const parsed = Number.parseInt(rawValue?.toString() || '', 10);
  if (!Number.isInteger(parsed) || parsed <= 0) return 50;
  return Math.min(parsed, 200);
};

const parseBoolean = (rawValue) => {
  if (rawValue === undefined || rawValue === null) return undefined;
  const value = rawValue.toString().toLowerCase();
  if (value === 'true' || value === '1') return true;
  if (value === 'false' || value === '0') return false;
  return undefined;
};

const parsePriority = (rawValue) => {
  if (!rawValue) return undefined;
  const value = rawValue.toString().toLowerCase();
  if (value === 'high' || value === 'medium' || value === 'low') return value;
  return undefined;
};

const toOptionalTrimmedString = (rawValue) => {
  if (rawValue === undefined || rawValue === null) return null;
  const value = rawValue.toString().trim();
  return value || null;
};

const hasWorkspaceAccess = async (workspaceId, userId) => {
  if (!workspaceId || !userId) return false;
  const membership = await prisma.workspaceMember.findFirst({
    where: { workspaceId, userId },
    select: { id: true },
  });
  return Boolean(membership);
};

router.get('/notifications', requireAuth, async (req, res) => {
  const limit = parseLimit(req.query.limit);
  const unreadFilter = parseBoolean(req.query.unread);
  const priority = parsePriority(req.query.priority);
  const type = req.query.type?.toString().trim();
  const workspaceId = toOptionalTrimmedString(req.query.workspaceId);

  if (workspaceId) {
    const allowed = await hasWorkspaceAccess(workspaceId, req.user.id);
    if (!allowed) {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }

  const notifications = await prisma.notification.findMany({
    where: {
      userId: req.user.id,
      ...(unreadFilter === true ? { readAt: null } : {}),
      ...(unreadFilter === false ? { NOT: { readAt: null } } : {}),
      ...(priority ? { priority } : {}),
      ...(type ? { type } : {}),
      ...(workspaceId ? { project: { workspaceId } } : {}),
    },
    include: notificationInclude,
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  res.json({ notifications: notifications.map(toApiNotification) });
});

router.patch('/notifications/:id/read', requireAuth, async (req, res) => {
  const existing = await prisma.notification.findFirst({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
    include: notificationInclude,
  });

  if (!existing) {
    return res.status(404).json({ error: 'Notification not found' });
  }

  if (existing.readAt) {
    return res.json({ notification: toApiNotification(existing) });
  }

  const notification = await prisma.notification.update({
    where: { id: req.params.id },
    data: { readAt: new Date() },
    include: notificationInclude,
  });

  publishNotificationUpdated(notification);

  res.json({ notification: toApiNotification(notification) });
});

router.patch('/notifications/read-all', requireAuth, async (req, res) => {
  const readAt = new Date();
  const workspaceId = toOptionalTrimmedString(req.query.workspaceId);

  if (workspaceId) {
    const allowed = await hasWorkspaceAccess(workspaceId, req.user.id);
    if (!allowed) {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }

  const { count } = await prisma.notification.updateMany({
    where: {
      userId: req.user.id,
      readAt: null,
      ...(workspaceId ? { project: { workspaceId } } : {}),
    },
    data: { readAt },
  });

  if (count > 0) {
    publishNotificationsReadAll(req.user.id, readAt, workspaceId);
  }

  res.json({
    updatedCount: count,
    readAt: readAt.toISOString(),
    workspaceId,
  });
});

router.delete('/notifications/:id', requireAuth, async (req, res) => {
  const existing = await prisma.notification.findFirst({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
    select: { id: true, userId: true },
  });

  if (!existing) {
    return res.status(404).json({ error: 'Notification not found' });
  }

  await prisma.notification.delete({
    where: { id: req.params.id },
  });

  publishNotificationDeleted(existing.userId, existing.id);

  res.status(204).send();
});

router.get('/notifications/stream', requireAuth, async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  res.write('event: ready\n');
  res.write(`data: ${JSON.stringify({ connectedAt: new Date().toISOString() })}\n\n`);

  const unregister = registerNotificationStream(req.user.id, res);
  const keepAlive = setInterval(() => {
    res.write(': keepalive\n\n');
  }, 25000);

  req.on('close', () => {
    clearInterval(keepAlive);
    unregister();
  });
});

export default router;
