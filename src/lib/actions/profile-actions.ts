"use server";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth-guards";
import { recordAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { updateProfileSchema } from "@/lib/validations/profile";

export type ProfileActionState = {
  error: string | null;
  success?: boolean;
};

export async function updateProfile(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const session = await requireAuth();

  const parsed = updateProfileSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
      success: false,
    };
  }

  const { name, phone } = parsed.data;

  // Retrieve existing user record.
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, role: true },
  });

  if (!user) {
    return {
      error: "User account not found.",
      success: false,
    };
  }

  // Check if user has an associated Employee directory record.
  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
    select: { id: true, employeeCode: true, name: true, phone: true, status: true },
  });

  if (employee && employee.status !== "ACTIVE") {
    return {
      error: "Inactive employee profiles cannot be modified.",
      success: false,
    };
  }

  const newPhone = phone ?? null;
  const hasNameChanged = (employee ? employee.name : user.name) !== name;
  const hasPhoneChanged = employee ? (employee.phone ?? null) !== newPhone : false;

  if (!hasNameChanged && !hasPhoneChanged) {
    return { error: null, success: true };
  }

  try {
    if (employee) {
      await prisma.$transaction(async (tx) => {
        await tx.employee.update({
          where: { id: employee.id },
          data: {
            name,
            phone: newPhone,
          },
        });

        await tx.user.update({
          where: { id: session.user.id },
          data: {
            name,
          },
        });
      });

      const isUserAdmin = session.user.role === "ADMIN";
      await recordAuditLog({
        actorId: session.user.id,
        action: isUserAdmin ? "ADMIN_PROFILE_UPDATED" : "EMPLOYEE_PROFILE_UPDATED",
        entityType: "Employee",
        entityId: employee.id,
        metadata: {
          employeeCode: employee.employeeCode,
          changes: {
            ...(hasNameChanged ? { previousName: employee.name, newName: name } : {}),
            ...(hasPhoneChanged ? { previousPhone: employee.phone, newPhone } : {}),
          },
        },
      });

      revalidatePath(`/employees/${employee.id}`);
    } else {
      // User without an Employee record (e.g. system administrator).
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          name,
        },
      });

      await recordAuditLog({
        actorId: session.user.id,
        action: "ADMIN_PROFILE_UPDATED",
        entityType: "User",
        entityId: user.id,
        metadata: {
          changes: {
            ...(hasNameChanged ? { previousName: user.name, newName: name } : {}),
          },
        },
      });
    }
  } catch (error) {
    console.error("[updateProfile] Error updating profile:", error);
    return {
      error: "Could not update profile. Please try again.",
      success: false,
    };
  }

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  revalidatePath("/my-assets");
  revalidatePath("/employees");

  return { error: null, success: true };
}
