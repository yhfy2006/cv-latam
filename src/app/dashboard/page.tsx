import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? "";

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
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <span className="font-bold text-lg">{productName}</span>
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">← Volver</Link>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-2">Bienvenido/a</h1>
        <p className="text-gray-500 mb-10">{email}</p>

        {user.isPaid ? (
          <div className="rounded-xl border border-green-200 bg-green-50 p-6">
            <p className="font-semibold text-green-800 mb-1">Acceso completo desbloqueado</p>
            <p className="text-sm text-green-700">
              {process.env.NEXT_PUBLIC_PAID_DASHBOARD_MESSAGE ?? "Tienes acceso completo. Crea y descarga tu CV con IA."}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 space-y-4">
            <p className="font-semibold text-gray-800">Plan gratuito</p>
            <p className="text-sm text-gray-600">
              {process.env.NEXT_PUBLIC_FREE_TIER_MESSAGE ?? "Desbloquea la experiencia completa con un pago único."}
            </p>
            <form action="/api/stripe/checkout" method="POST">
              <Button type="submit">
                Desbloquear por {process.env.NEXT_PUBLIC_PRICE ?? "$9"} USD
              </Button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
