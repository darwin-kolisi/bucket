import { prisma } from './auth.js';

const notificationStreams = new Map();
const HIGH_SIGNAL_NOTIFICATION_TYPE_SET = new Set([
  'project_due_soon',
  'project_overdue',
  'task_due_soon',
  'task_overdue',
  'task_completed',
  'project_reminder',
  'task_reminder',
  'reminder',
]);

export const HIGH_SIGNAL_NOTIFICATION_TYPES = [...HIGH_SIGNAL_NOTIFICATION_TYPE_SET];

const normalizePriority = (value) => {
  const normalized = value?.toString().toLowerCase();
  if (normalized === 'high') return 'high';
  if (normalized === 'low') return 'low';
  return 'medium';
};

export const isHighSignalNotificationType = (value) =>
  HIGH_SIGNAL_NOTIFICATION_TYPE_SET.has(value?.toString().trim().toLowerCase() || '');

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
  starred: Boolean(notification.starredAt),
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
  if (!isHighSignalNotificationType(notification?.type)) return;
  publishToUser(notification.userId, 'notification.created', {
    notification: toApiNotification(notification),
  });
};

export const publishNotificationUpdated = (notification) => {
  if (!isHighSignalNotificationType(notification?.type)) return;
  publishToUser(notification.userId, 'notification.updated', {
    notification: toApiNotification(notification),
  });
};

export const publishNotificationsReadAll = (userId, readAt, workspaceId = null) => {
  publishToUser(userId, 'notifications.read_all', {
    readAt: readAt.toISOString(),
    workspaceId,
  });
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
  if (!isHighSignalNotificationType(type)) return [];

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

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const toUtcDateOnlyFromParts = (year, monthIndex, day) => {
  const parsed = new Date(Date.UTC(year, monthIndex, day));
  if (Number.isNaN(parsed.getTime())) return null;
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== monthIndex ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }
  return parsed;
};

const toUtcDateOnly = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return toUtcDateOnlyFromParts(
    parsed.getUTCFullYear(),
    parsed.getUTCMonth(),
    parsed.getUTCDate()
  );
};

const compareUtcDateOnly = (leftValue, rightValue) => {
  const left = toUtcDateOnly(leftValue);
  const right = toUtcDateOnly(rightValue);
  if (!left && !right) return 0;
  if (!left) return -1;
  if (!right) return 1;
  return Math.round((left.getTime() - right.getTime()) / MS_PER_DAY);
};

const getDueDateState = (value) => {
  const dueDate = toUtcDateOnly(value);
  if (!dueDate) return null;
  const today = toUtcDateOnly(new Date());
  const deltaDays = compareUtcDateOnly(dueDate, today);
  if (deltaDays < 0) return 'overdue';
  if (deltaDays <= 1) return 'due_soon';
  return null;
};

const formatDateUtc = (value) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsed);
};

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
  const normalizedStatus = statusValue
    ?.toString()
    .toLowerCase()
    .replace(/-/g, '_') || 'todo';

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

const getUtcDayStart = (value = new Date()) => {
  const parsed = new Date(value);
  return new Date(
    Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate())
  );
};

const getRecipientsMissingTodayDueNotification = async ({
  userIds,
  type,
  projectId = null,
  taskId = null,
}) => {
  const recipients = uniqueUserIds(userIds);
  if (recipients.length === 0) return [];

  const existing = await prisma.notification.findMany({
    where: {
      userId: { in: recipients },
      type,
      createdAt: { gte: getUtcDayStart() },
      ...(projectId ? { projectId } : {}),
      ...(taskId ? { taskId } : {}),
    },
    select: { userId: true },
  });

  const notifiedUserIds = new Set(existing.map((notification) => notification.userId));
  return recipients.filter((userId) => !notifiedUserIds.has(userId));
};

const createDailyDueNotificationsForUsers = async ({
  userIds,
  type,
  title,
  message,
  priority = 'high',
  projectId = null,
  taskId = null,
}) => {
  const recipients = await getRecipientsMissingTodayDueNotification({
    userIds,
    type,
    projectId,
    taskId,
  });

  if (recipients.length === 0) return [];

  return createNotificationsForUsers({
    userIds: recipients,
    type,
    title,
    message,
    priority,
    projectId,
    taskId,
  });
};

export const createDailyDueNotificationsForWorkspace = async ({
  workspaceId,
  type,
  title,
  message,
  priority = 'high',
  projectId = null,
  taskId = null,
}) => {
  if (!workspaceId) return [];

  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    select: { userId: true },
  });

  return createDailyDueNotificationsForUsers({
    userIds: members.map((member) => member.userId),
    type,
    title,
    message,
    priority,
    projectId,
    taskId,
  });
};

export const runDueDateNotificationSweep = async () => {
  const [projects, tasks] = await Promise.all([
    prisma.project.findMany({
      where: {
        deletedAt: null,
        dueDate: { not: null },
      },
      select: {
        id: true,
        name: true,
        dueDate: true,
        workspace: {
          select: {
            members: {
              select: { userId: true },
            },
          },
        },
      },
    }),
    prisma.task.findMany({
      where: {
        deletedAt: null,
        dueDate: { not: null },
        project: {
          deletedAt: null,
        },
      },
      select: {
        id: true,
        title: true,
        status: true,
        subtasks: true,
        dueDate: true,
        project: {
          select: {
            id: true,
            name: true,
            workspace: {
              select: {
                members: {
                  select: { userId: true },
                },
              },
            },
          },
        },
      },
    }),
  ]);

  let createdCount = 0;

  for (const project of projects) {
    const dueDateState = getDueDateState(project.dueDate);
    if (!dueDateState) continue;

    const notifications = await createDailyDueNotificationsForUsers({
      userIds: project.workspace.members.map((member) => member.userId),
      type: dueDateState === 'due_soon' ? 'project_due_soon' : 'project_overdue',
      title: dueDateState === 'due_soon' ? 'Project due soon' : 'Project overdue',
      message:
        dueDateState === 'due_soon'
          ? `"${project.name}" is due on ${formatDateUtc(project.dueDate)}.`
          : `"${project.name}" is overdue since ${formatDateUtc(project.dueDate)}.`,
      priority: 'high',
      projectId: project.id,
    });
    createdCount += notifications.length;
  }

  for (const task of tasks) {
    const resolved = resolveTaskStatusAndSubtasks(task.subtasks, task.status);
    if (resolved.status === 'done') continue;

    const dueDateState = getDueDateState(task.dueDate);
    if (!dueDateState) continue;

    const notifications = await createDailyDueNotificationsForUsers({
      userIds: task.project.workspace.members.map((member) => member.userId),
      type: dueDateState === 'due_soon' ? 'task_due_soon' : 'task_overdue',
      title: dueDateState === 'due_soon' ? 'Task due soon' : 'Task overdue',
      message:
        dueDateState === 'due_soon'
          ? `"${task.title}" is due on ${formatDateUtc(task.dueDate)}.`
          : `"${task.title}" is overdue since ${formatDateUtc(task.dueDate)}.`,
      priority: 'high',
      projectId: task.project.id,
      taskId: task.id,
    });
    createdCount += notifications.length;
  }

  return { createdCount };
};
