'use server';

import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export interface GlobalNotification {
  enabled: boolean;
  header: string;
  message: string;
  imageUrl?: string;
  link?: string;
}

const NOTIFICATION_KEY = 'global_notification';

export async function getGlobalNotification(): Promise<GlobalNotification | null> {
  try {
    const [result] = await db.select().from(settings).where(eq(settings.key, NOTIFICATION_KEY)).limit(1);
    if (!result) return null;
    return JSON.parse(result.value) as GlobalNotification;
  } catch (error) {
    console.error("Failed to fetch notification:", error);
    return null;
  }
}

export async function updateGlobalNotification(data: GlobalNotification) {
  const session = await auth();
  const user = session?.user as any;

  if (!user || user.role !== 'superadmin') {
    return { error: "Unauthorized: Only superadmin can manage notifications" };
  }

  try {
    const value = JSON.stringify(data);
    
    // Check if exists
    const [existing] = await db.select().from(settings).where(eq(settings.key, NOTIFICATION_KEY)).limit(1);
    
    if (existing) {
      await db.update(settings).set({ value }).where(eq(settings.key, NOTIFICATION_KEY));
    } else {
      await db.insert(settings).values({ key: NOTIFICATION_KEY, value });
    }

    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to update notification:", error);
    return { error: "Internal Server Error" };
  }
}
