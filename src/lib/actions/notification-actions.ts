"use server";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

export type NotificationActionState = { error: string | null };

/**
 * Mark a single notification as read.
 * Derives the authenticated user from the session — never trusts the client.
 */
export async function markNotificationRead(
  notificationId: string
): Promise<NotificationActionState> {
  const session = await requireAuth();

  // updateMany with userId guard: silently no-ops if it belongs to someone else.
  await prisma.notification.updateMany({
    where: { id: notificationId, userId: session.user.id },
    data: { read: true },
  });

  revalidatePath("/", "layout");
  return { error: null };
}

/**
 * Mark ALL of the current user's notifications as read.
 */
export async function markAllNotificationsRead(): Promise<NotificationActionState> {
  const session = await requireAuth();

  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  });

  revalidatePath("/", "layout");
  return { error: null };
}
