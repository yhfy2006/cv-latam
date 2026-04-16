import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cvGenerations, ipRateLimits, users } from "@/lib/schema";
import { generateCv, type CvInput } from "@/lib/anthropic";
import { captureServerEvent } from "@/lib/posthog";
import { eq } from "drizzle-orm";

const RATE_LIMIT_HOURS = 24;

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { userId } = await auth();

  // Check if paid user (paid users bypass IP rate limit)
  let isPaid = false;
  if (userId) {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, userId))
      .get();
    isPaid = user?.isPaid ?? false;
  }

  // IP rate limiting for free tier
  if (!isPaid) {
    const existing = await db
      .select()
      .from(ipRateLimits)
      .where(eq(ipRateLimits.ipAddress, ip))
      .get();

    if (existing) {
      const hoursSinceLastGen =
        (Date.now() - existing.lastGenerationAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastGen < RATE_LIMIT_HOURS) {
        const hoursRemaining = Math.ceil(RATE_LIMIT_HOURS - hoursSinceLastGen);
        return NextResponse.json(
          {
            error: `Límite alcanzado. Puedes generar otro CV en ${hoursRemaining} hora${hoursRemaining > 1 ? "s" : ""}.`,
            rateLimited: true,
          },
          { status: 429 }
        );
      }
    }
  }

  let input: CvInput;
  try {
    input = await req.json();
  } catch {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  // Basic validation
  if (!input.nombre || !input.experiencia?.length) {
    return NextResponse.json(
      { error: "Nombre y experiencia laboral son requeridos" },
      { status: 400 }
    );
  }

  let generatedCv;
  try {
    generatedCv = await generateCv(input);
  } catch (err) {
    console.error("CV generation error:", err);
    return NextResponse.json(
      { error: "Error al generar el CV. Por favor intenta de nuevo." },
      { status: 500 }
    );
  }

  // Persist to DB
  await db.insert(cvGenerations).values({
    clerkUserId: userId ?? null,
    ipAddress: ip,
    inputData: JSON.stringify(input),
    generatedCv: JSON.stringify(generatedCv),
  });

  // Update IP rate limit
  if (!isPaid) {
    const existingLimit = await db
      .select()
      .from(ipRateLimits)
      .where(eq(ipRateLimits.ipAddress, ip))
      .get();

    if (existingLimit) {
      await db
        .update(ipRateLimits)
        .set({
          lastGenerationAt: new Date(),
          generationCount: existingLimit.generationCount + 1,
        })
        .where(eq(ipRateLimits.ipAddress, ip));
    } else {
      await db
        .insert(ipRateLimits)
        .values({ ipAddress: ip, lastGenerationAt: new Date(), generationCount: 1 });
    }
  }

  const clerkUser = userId ? await currentUser() : null;
  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? ip;
  await captureServerEvent(email, "cv_generated", {
    isPaid,
    industria: input.industria,
  }).catch(console.error);

  return NextResponse.json({ cv: generatedCv, isPaid });
}
