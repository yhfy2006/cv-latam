import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/stripe";

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? "";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const session = await createCheckoutSession({
    userId,
    email,
    successUrl: `${baseUrl}/dashboard?payment=success`,
    cancelUrl: `${baseUrl}/dashboard`,
  });

  return NextResponse.redirect(session.url!, { status: 303 });
}
