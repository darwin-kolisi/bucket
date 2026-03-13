import express from 'express';
import { prisma } from '../lib/auth.js';
import {
  HIGH_SIGNAL_NOTIFICATION_TYPES,
  notificationInclude,
  publishNotificationCreated,
  toApiNotification,
  publishNotificationUpdated,
  publishNotificationsReadAll,
  publishNotificationDeleted,
  registerNotificationStream,
} from '../lib/notifications.js';
import { requireAuth } from './utils.js';

const router = express.Router();

const parseLimit = (rawValue) => {
  if (rawValue === undefined || rawValue === null || rawValue === '') return null;
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

const normalizeNotificationIds = (value) => {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((item) => item?.toString().trim()).filter(Boolean))];
};

const buildNotificationWhere = ({
  userId,
  workspaceId = null,
  unreadFilter,
  priority,
  type,
  starredFilter,
  ids,
  searchQuery,
  includeDeleted = false,
}) => {
  const where = {
    userId,
    type: { in: HIGH_SIGNAL_NOTIFICATION_TYPES },
  };

  if (!includeDeleted) {
    where.deletedAt = null;
  }

  if (unreadFilter === true) {
    where.readAt = null;
  } else if (unreadFilter === false) {
    where.NOT = { ...(where.NOT || {}), readAt: null };
  }

  if (priority) {
    where.priority = priority;
  }

  if (type) {
    if (!HIGH_SIGNAL_NOTIFICATION_TYPES.includes(type)) {
      where.id = '__no_match__';
      return where;
    }
    where.type = type;
  }

  if (starredFilter === true) {
    where.starredAt = { not: null };
  } else if (starredFilter === false) {
    where.starredAt = null;
  }

  if (workspaceId) {
    where.project = { workspaceId };
  }

  if (ids?.length) {
    where.id = { in: ids };
  }

  if (searchQuery) {
    where.AND = [
      ...(where.AND || []),
      {
        OR: [
          { title: { contains: searchQuery, mode: 'insensitive' } },
          { message: { contains: searchQuery, mode: 'insensitive' } },
          { project: { name: { contains: searchQuery, mode: 'insensitive' } } },
          { task: { title: { contains: searchQuery, mode: 'insensitive' } } },
        ],
      },
    ];
  }

  return where;
};

const hasWorkspaceAccess = async (workspaceId, userId) => {
  if (!workspaceId || !userId) return false;
  const membership = await prisma.workspaceMember.findFirst({
    where: { workspaceId, userId },
    select: { id: true },
  });
  return Boolean(membership);
};

const buildNotificationTrashData = () => ({
  deletedAt: new Date(),
  readAt: new Date(),
});

const updateNotificationState = async ({ notificationId, userId, read, starred }) => {
  const existing = await prisma.notification.findFirst({
    where: buildNotificationWhere({
      userId,
      ids: [notificationId],
    }),
    include: notificationInclude,
  });

  if (!existing) {
    return { error: 'Notification not found', status: 404 };
  }

  const data = {};
  if (read === true) {
    data.readAt = existing.readAt || new Date();
  } else if (read === false) {
    data.readAt = null;
  }

  if (starred === true) {
    data.starredAt = existing.starredAt || new Date();
  } else if (starred === false) {
    data.starredAt = null;
  }

  if (Object.keys(data).length === 0) {
    return { notification: toApiNotification(existing) };
  }

  const notification = await prisma.notification.update({
    where: { id: notificationId },
    data,
    include: notificationInclude,
  });

  publishNotificationUpdated(notification);

  return { notification: toApiNotification(notification) };
};

const findTrashedNotification = (notificationId, userId, include = notificationInclude) =>
  prisma.notification.findFirst({
    where: {
      ...buildNotificationWhere({
        userId,
        ids: [notificationId],
        includeDeleted: true,
      }),
      deletedAt: { not: null },
    },
    include,
  });

router.get('/notifications/trash', requireAuth, async (req, res) => {
  const limit = parseLimit(req.query.limit) ?? 50;
  const workspaceId = toOptionalTrimmedString(req.query.workspaceId);

  if (workspaceId) {
    const allowed = await hasWorkspaceAccess(workspaceId, req.user.id);
    if (!allowed) {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }

  const notifications = await prisma.notification.findMany({
    where: {
      ...buildNotificationWhere({
        userId: req.user.id,
        workspaceId,
        includeDeleted: true,
      }),
      deletedAt: { not: null },
    },
    include: notificationInclude,
    orderBy: { deletedAt: 'desc' },
    take: limit,
  });

  res.json({ notifications: notifications.map(toApiNotification) });
});

router.get('/notifications', requireAuth, async (req, res) => {
  const limit = parseLimit(req.query.limit) ?? 50;
  const unreadFilter = parseBoolean(req.query.unread);
  const starredFilter = parseBoolean(req.query.starred);
  const priority = parsePriority(req.query.priority);
  const type = toOptionalTrimmedString(req.query.type);
  const workspaceId = toOptionalTrimmedString(req.query.workspaceId);
  const searchQuery = toOptionalTrimmedString(req.query.q);
  const cursor = toOptionalTrimmedString(req.query.cursor);

  if (workspaceId) {
    const allowed = await hasWorkspaceAccess(workspaceId, req.user.id);
    if (!allowed) {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }

  const notifications = await prisma.notification.findMany({
    where: buildNotificationWhere({
      userId: req.user.id,
      workspaceId,
      unreadFilter,
      priority,
      type,
      starredFilter,
      searchQuery,
    }),
    include: notificationInclude,
    orderBy: [{ starredAt: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }],
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = notifications.length > limit;
  const sliced = hasMore ? notifications.slice(0, limit) : notifications;
  const nextCursor = hasMore ? sliced[sliced.length - 1]?.id : null;

  res.json({
    notifications: sliced.map(toApiNotification),
    nextCursor,
    hasMore,
  });
});

router.patch('/notifications/:id/read', requireAuth, async (req, res) => {
  const result = await updateNotificationState({
    notificationId: req.params.id,
    userId: req.user.id,
    read: true,
  });

  if (result.error) {
    return res.status(result.status || 400).json({ error: result.error });
  }

  res.json({ notification: result.notification });
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
    where: buildNotificationWhere({
      userId: req.user.id,
      workspaceId,
      unreadFilter: true,
    }),
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

router.patch('/notifications', requireAuth, async (req, res) => {
  const ids = normalizeNotificationIds(req.body?.ids);
  const read = parseBoolean(req.body?.read);
  const starred = parseBoolean(req.body?.starred);

  if (ids.length === 0) {
    return res.status(400).json({ error: 'Notification ids are required.' });
  }

  if (read === undefined && starred === undefined) {
    return res.status(400).json({ error: 'No valid updates provided.' });
  }

  const where = buildNotificationWhere({
    userId: req.user.id,
    ids,
  });

  const existing = await prisma.notification.findMany({
    where,
    select: { id: true, readAt: true, starredAt: true },
  });

  if (existing.length === 0) {
    return res.json({ notifications: [], updatedCount: 0 });
  }

  const changedIds = [];
  const updates = existing
    .map((notification) => {
      const data = {};

      if (read === true && !notification.readAt) {
        data.readAt = new Date();
      } else if (read === false && notification.readAt) {
        data.readAt = null;
      }

      if (starred === true && !notification.starredAt) {
        data.starredAt = new Date();
      } else if (starred === false && notification.starredAt) {
        data.starredAt = null;
      }

      if (Object.keys(data).length === 0) return null;
      changedIds.push(notification.id);

      return prisma.notification.update({
        where: { id: notification.id },
        data,
      });
    })
    .filter(Boolean);

  if (updates.length > 0) {
    await prisma.$transaction(updates);
  }

  const notifications = await prisma.notification.findMany({
    where: {
      id: { in: existing.map((notification) => notification.id) },
      userId: req.user.id,
    },
    include: notificationInclude,
  });

  for (const notification of notifications.filter((item) => changedIds.includes(item.id))) {
    publishNotificationUpdated(notification);
  }

  res.json({
    notifications: notifications.map(toApiNotification),
    updatedCount: changedIds.length,
  });
});

router.patch('/notifications/:id', requireAuth, async (req, res) => {
  const result = await updateNotificationState({
    notificationId: req.params.id,
    userId: req.user.id,
    read: parseBoolean(req.body?.read),
    starred: parseBoolean(req.body?.starred),
  });

  if (result.error) {
    return res.status(result.status || 400).json({ error: result.error });
  }

  res.json({ notification: result.notification });
});

router.patch('/notifications/:id/restore', requireAuth, async (req, res) => {
  const existing = await findTrashedNotification(req.params.id, req.user.id, notificationInclude);

  if (!existing) {
    return res.status(404).json({ error: 'Notification not found in trash' });
  }

  const notification = await prisma.notification.update({
    where: { id: req.params.id },
    data: { deletedAt: null },
    include: notificationInclude,
  });

  publishNotificationCreated(notification);

  res.json({ notification: toApiNotification(notification) });
});

router.delete('/notifications/bulk', requireAuth, async (req, res) => {
  const ids = normalizeNotificationIds(req.body?.ids);

  if (ids.length === 0) {
    return res.status(400).json({ error: 'Notification ids are required.' });
  }

  const notifications = await prisma.notification.findMany({
    where: buildNotificationWhere({
      userId: req.user.id,
      ids,
    }),
    select: { id: true, userId: true },
  });

  if (notifications.length === 0) {
    return res.json({ deletedCount: 0 });
  }

  await prisma.notification.updateMany({
    where: {
      id: { in: notifications.map((notification) => notification.id) },
      userId: req.user.id,
      deletedAt: null,
    },
    data: buildNotificationTrashData(),
  });

  for (const notification of notifications) {
    publishNotificationDeleted(notification.userId, notification.id);
  }

  res.json({ deletedCount: notifications.length });
});

router.delete('/notifications/:id/permanent', requireAuth, async (req, res) => {
  const existing = await prisma.notification.findFirst({
    where: {
      ...buildNotificationWhere({
        userId: req.user.id,
        ids: [req.params.id],
        includeDeleted: true,
      }),
      deletedAt: { not: null },
    },
    select: {
      id: true,
    },
  });

  if (!existing) {
    return res.status(404).json({ error: 'Notification not found in trash' });
  }

  await prisma.notification.delete({
    where: { id: req.params.id },
  });

  res.status(204).send();
});

router.delete('/notifications', requireAuth, async (req, res) => {
  const workspaceId = toOptionalTrimmedString(req.query.workspaceId);

  if (workspaceId) {
    const allowed = await hasWorkspaceAccess(workspaceId, req.user.id);
    if (!allowed) {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }

  const notifications = await prisma.notification.findMany({
    where: buildNotificationWhere({
      userId: req.user.id,
      workspaceId,
    }),
    select: { id: true, userId: true },
  });

  if (notifications.length === 0) {
    return res.json({ deletedCount: 0, workspaceId });
  }

  await prisma.notification.updateMany({
    where: {
      id: { in: notifications.map((notification) => notification.id) },
      userId: req.user.id,
      deletedAt: null,
    },
    data: buildNotificationTrashData(),
  });

  for (const notification of notifications) {
    publishNotificationDeleted(notification.userId, notification.id);
  }

  res.json({ deletedCount: notifications.length, workspaceId });
});

router.delete('/notifications/:id', requireAuth, async (req, res) => {
  const existing = await prisma.notification.findFirst({
    where: buildNotificationWhere({
      userId: req.user.id,
      ids: [req.params.id],
    }),
    select: { id: true, userId: true },
  });

  if (!existing) {
    return res.status(404).json({ error: 'Notification not found' });
  }

  await prisma.notification.update({
    where: { id: req.params.id },
    data: buildNotificationTrashData(),
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
