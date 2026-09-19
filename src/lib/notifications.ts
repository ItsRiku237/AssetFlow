import "server-only";

import { prisma } from "@/lib/prisma";

interface CreateNotificationInput {
  userId: string;
  title: string;
  message: string;
  link?: string;
}

/**
 * Create a single notification. Errors are swallowed so a notification
 * failure never breaks the calling business operation.
 */
export async function createNotification(
  input: CreateNotificationInput
): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId: input.userId,
        title: input.title,
        message: input.message,
        link: input.link ?? null,
      },
    });
  } catch (err) {
    // Non-critical — log but don't propagate.
    console.error("[notification] Failed to create notification:", err);
  }
}

/**
 * Create notifications for multiple recipients at once (e.g. all admins).
 */
export async function createNotifications(
  inputs: CreateNotificationInput[]
): Promise<void> {
  if (inputs.length === 0) return;
  try {
    await prisma.notification.createMany({
      data: inputs.map((n) => ({
        userId: n.userId,
        title: n.title,
        message: n.message,
        link: n.link ?? null,
      })),
    });
  } catch (err) {
    console.error("[notification] Failed to create notifications:", err);
  }
}

/**
 * Fetch all admin user IDs so we can fan-out admin notifications without
 * hardcoding IDs. Errors return an empty array so callers stay safe.
 */
export async function getAdminUserIds(): Promise<string[]> {
  try {
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });
    return admins.map((a) => a.id);
  } catch {
    return [];
  }
}
