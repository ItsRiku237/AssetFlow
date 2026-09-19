import "server-only";

import { prisma } from "@/lib/prisma";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: Date;
}

export async function getUserNotifications(
  userId: string,
  limit = 20
): Promise<NotificationItem[]> {
  const rows = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      message: true,
      link: true,
      read: true,
      createdAt: true,
    },
  });
  return rows;
}

export async function getUnreadNotificationCount(
  userId: string
): Promise<number> {
  return prisma.notification.count({ where: { userId, read: false } });
}
