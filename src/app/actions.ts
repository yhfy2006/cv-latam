"use server";

import { db } from "@/lib/db";
import { waitlistEntries } from "@/lib/schema";
import { sendWaitlistConfirmation } from "@/lib/resend";
import { captureServerEvent } from "@/lib/posthog";
import { eq } from "drizzle-orm";

export async function joinWaitlist(formData: FormData) {
  const email = formData.get("email");
  if (!email || typeof email !== "string") {
    return { error: "Email is required" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "Invalid email address" };
  }

  const existing = await db
    .select()
    .from(waitlistEntries)
    .where(eq(waitlistEntries.email, email.toLowerCase()))
    .get();

  if (existing) {
    return { success: true, alreadyExists: true };
  }

  await db.insert(waitlistEntries).values({
    email: email.toLowerCase(),
    source: "landing",
  });

  await Promise.allSettled([
    sendWaitlistConfirmation(email),
    captureServerEvent(email, "waitlist_signup", { source: "landing" }),
  ]);

  return { success: true };
}
