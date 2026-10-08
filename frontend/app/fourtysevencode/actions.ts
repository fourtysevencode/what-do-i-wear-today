"use server";

import { revalidatePath } from "next/cache";

import { ADMIN_PATH, adminConfigured, checkAdminPassword, endAdminSession, startAdminSession } from "@/lib/admin";

export type AdminLoginState = { error: string } | undefined;

export async function adminLogin(_prev: AdminLoginState, formData: FormData): Promise<AdminLoginState> {
  if (!adminConfigured()) return { error: "This page isn't set up. Add ADMIN_PASSWORD to the environment." };

  const attempt = String(formData.get("password") ?? "");
  if (!attempt || !checkAdminPassword(attempt)) {
    // Slow down guessing.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { error: "Wrong password." };
  }

  await startAdminSession();
  revalidatePath(ADMIN_PATH);
}

export async function adminLogout() {
  await endAdminSession();
  revalidatePath(ADMIN_PATH);
}
