import { prisma } from './auth.js';

const notificationStreams = new Map();

const normalizePriority = (value) => {
  const normalized = value?.toString().toLowerCase();
  if (normalized === 'high') return 'high';
  if (normalized === 'low') return 'low';
  return 'medium';
};

const toUiTaskStatus = (status) => status?.replace(/_/g, '-') || 'todo';

export const notificationInclude = {
  project: {
    select: { id: true, name: true, workspaceId: true },
  },
  task: {
    select: { id: true, title: true, status: true },
  },
  note: {
    select: { id: true, title: true },
  },
};

export const toApiNotification = (notification) => ({
  ...notification,
  read: Boolean(notification.readAt),
  task: notification.task
    ? { ...notification.task, status: toUiTaskStatus(notification.task.status) }
    : null,
});

const writeSse = (res, event, payload) => {
  try {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  } catch (error) {
    // Ignore stale stream writes.
  }
};

const publishToUser = (userId, event, payload) => {
  if (!userId) return;
  const streams = notificationStreams.get(userId);
  if (!streams?.size) return;
  for (const stream of streams) {
    writeSse(stream, event, payload);
  }
};

export const registerNotificationStream = (userId, res) => {
  if (!notificationStreams.has(userId)) {
    notificationStreams.set(userId, new Set());
  }
  const streams = notificationStreams.get(userId);
  streams.add(res);

  return () => {
    streams.delete(res);
    if (streams.size === 0) {
      notificationStreams.delete(userId);
    }
  };
};

export const publishNotificationCreated = (notification) => {
  publishToUser(notification.userId, 'notification.created', {
    notification: toApiNotification(notification),
  });
};

export const publishNotificationUpdated = (notification) => {
  publishToUser(notification.userId, 'notification.updated', {
    notification: toApiNotification(notification),
  });
};

export const publishNotificationsReadAll = (userId, readAt) => {
  publishToUser(userId, 'notifications.read_all', { readAt: readAt.toISOString() });
};

export const publishNotificationDeleted = (userId, notificationId) => {
  publishToUser(userId, 'notification.deleted', { notificationId });
};

const uniqueUserIds = (userIds) =>
  [...new Set((userIds || []).map((id) => id?.toString().trim()).filter(Boolean))];

export const createNotificationsForUsers = async ({
  userIds,
  type,
  title,
  message,
  priority = 'medium',
  projectId = null,
  taskId = null,
  noteId = null,
  metadata,
}) => {
  const recipients = uniqueUserIds(userIds);
  if (recipients.length === 0) return [];

  const notifications = await prisma.$transaction(
    recipients.map((userId) =>
      prisma.notification.create({
        data: {
          userId,
          type: type.toString(),
          title: title.toString().trim(),
          message: message.toString().trim(),
          priority: normalizePriority(priority),
          projectId,
          taskId,
          noteId,
          ...(metadata === undefined ? {} : { metadata }),
        },
        include: notificationInclude,
      })
    )
  );

  for (const notification of notifications) {
    publishNotificationCreated(notification);
  }

  return notifications.map(toApiNotification);
};

export const createWorkspaceNotifications = async ({
  workspaceId,
  type,
  title,
  message,
  priority = 'medium',
  projectId = null,
  taskId = null,
  noteId = null,
  metadata,
}) => {
  if (!workspaceId) return [];

  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    select: { userId: true },
  });

  return createNotificationsForUsers({
    userIds: members.map((member) => member.userId),
    type,
    title,
    message,
    priority,
    projectId,
    taskId,
    noteId,
    metadata,
  });
};
