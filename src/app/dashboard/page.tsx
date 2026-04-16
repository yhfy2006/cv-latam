import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CvBuilder } from "@/components/CvBuilder";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? "";
  const params = await searchParams;

  let user = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, userId))
    .get();

  if (!user) {
    const [created] = await db
      .insert(users)
      .values({ clerkUserId: userId, email })
      .returning();
    user = created;
  }

  const productName = process.env.NEXT_PUBLIC_SITE_NAME ?? "CurriculumIA";

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
        <span className="font-bold text-lg">{productName}</span>
        <div className="flex items-center gap-4">
          {user.isPaid && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
              Acceso completo
            </span>
          )}
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
            ← Inicio
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-10">
        {params.payment === "success" && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 font-medium">
            ¡Pago exitoso! Ya tienes acceso completo para descargar tu CV en PDF.
          </div>
        )}

        {!user.isPaid && (
          <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">Plan gratuito activo</p>
                <p className="text-sm text-gray-500 mt-1">
                  Genera tu CV con IA y descárgalo en PDF por un único pago de $9 USD.
                </p>
              </div>
              <form action="/api/stripe/checkout" method="POST">
                <Button type="submit" size="sm">
                  Desbloquear PDF — $9
                </Button>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h1 className="text-2xl font-bold mb-2">Crea tu CV con IA</h1>
          <p className="text-gray-500 text-sm mb-8">
            Completa el formulario y nuestra IA generará un CV profesional optimizado para el mercado latinoamericano.
          </p>
          <CvBuilder isPaid={user.isPaid} />
        </div>
      </main>
    </div>
  );
}
