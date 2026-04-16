import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { pdf } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import { CvPdfDocument } from "@/components/CvPdfDocument";
import type { CvOutput } from "@/lib/anthropic";
import { captureServerEvent } from "@/lib/posthog";
import React from "react";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, userId))
    .get();

  if (!user?.isPaid) {
    return NextResponse.json(
      { error: "Acceso requerido. Desbloquea por $9 USD." },
      { status: 403 }
    );
  }

  let cv: CvOutput;
  try {
    const body = await req.json();
    cv = body.cv;
  } catch {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const element = React.createElement(CvPdfDocument, { cv }) as React.ReactElement<DocumentProps>;
  const blob = await pdf(element).toBlob();

  const arrayBuffer = await blob.arrayBuffer();

  await captureServerEvent(user.email, "cv_pdf_exported", {}).catch(console.error);

  return new NextResponse(arrayBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="cv-${cv.nombre.replace(/\s+/g, "-").toLowerCase()}.pdf"`,
    },
  });
}
