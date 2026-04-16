import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { WaitlistForm } from "@/components/WaitlistForm";
import { SignInButton, Show, UserButton } from "@clerk/nextjs";
import Link from "next/link";

const FEATURES = [
  {
    title: process.env.NEXT_PUBLIC_FEATURE_1_TITLE ?? "CV con IA en segundos",
    description: process.env.NEXT_PUBLIC_FEATURE_1_DESC ?? "Completa un formulario simple y nuestra IA genera un CV profesional adaptado a tu industria y experiencia.",
  },
  {
    title: process.env.NEXT_PUBLIC_FEATURE_2_TITLE ?? "Optimizado para LATAM",
    description: process.env.NEXT_PUBLIC_FEATURE_2_DESC ?? "Formatos y fraseología adaptados al mercado laboral latinoamericano: Argentina, México, Colombia, Chile y más.",
  },
  {
    title: process.env.NEXT_PUBLIC_FEATURE_3_TITLE ?? "Descarga en PDF al instante",
    description: process.env.NEXT_PUBLIC_FEATURE_3_DESC ?? "Obtén tu CV listo para enviar en PDF con diseño limpio y profesional. Sin suscripciones, pago único.",
  },
];

export default function HomePage() {
  const productName = process.env.NEXT_PUBLIC_SITE_NAME ?? "CurriculumIA";
  const tagline = process.env.NEXT_PUBLIC_TAGLINE ?? "Tu CV profesional en minutos con inteligencia artificial";
  const subtagline = process.env.NEXT_PUBLIC_SUBTAGLINE ?? "Deja de perder oportunidades por un CV desactualizado. CurriculumIA genera tu hoja de vida optimizada para el mercado laboral de LATAM en segundos.";
  const price = process.env.NEXT_PUBLIC_PRICE ?? "$9";

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <span className="font-bold text-lg">{productName}</span>
        <div className="flex items-center gap-4">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="text-sm text-gray-600 hover:text-gray-900">Iniciar sesión</button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">Mi panel</Link>
            <UserButton />
          </Show>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 py-24 gap-6 max-w-3xl mx-auto">
        <Badge variant="secondary">{process.env.NEXT_PUBLIC_BADGE_TEXT ?? "Ya disponible"}</Badge>
        <h1 className="text-5xl font-bold leading-tight tracking-tight text-gray-900">
          {tagline}
        </h1>
        <p className="text-xl text-gray-500 max-w-xl">
          {subtagline}
        </p>
        <WaitlistForm />
        <p className="text-sm text-gray-400">
          {process.env.NEXT_PUBLIC_SOCIAL_PROOF ?? "Únete a los primeros usuarios y obtén acceso anticipado."}
        </p>
      </section>

      <Separator />

      {/* Features */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          {process.env.NEXT_PUBLIC_FEATURES_HEADING ?? "Todo lo que necesitas para conseguir trabajo"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURES.map((f) => (
            <div key={f.title} className="p-6 rounded-xl border border-gray-100 bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Pricing */}
      <section className="py-20 px-6 max-w-xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4 text-gray-900">Precio simple</h2>
        <p className="text-gray-500 mb-8">Pago único. Sin suscripciones.</p>
        <div className="rounded-2xl border border-gray-200 p-8 bg-gray-50">
          <div className="text-5xl font-bold text-gray-900 mb-2">{price} USD</div>
          <div className="text-gray-500 mb-6">pago único</div>
          <ul className="text-left space-y-2 text-sm text-gray-600 mb-8">
            <li>✓ {process.env.NEXT_PUBLIC_PRICING_ITEM_1 ?? "CV profesional generado por IA"}</li>
            <li>✓ {process.env.NEXT_PUBLIC_PRICING_ITEM_2 ?? "Descarga en PDF al instante"}</li>
            <li>✓ {process.env.NEXT_PUBLIC_PRICING_ITEM_3 ?? "Acceso de por vida a tu CV"}</li>
          </ul>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="w-full rounded-lg bg-gray-900 text-white py-3 font-medium hover:bg-gray-700 transition-colors">
                Crear mi CV por {price} USD
              </button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <Link
              href="/dashboard"
              className="block w-full rounded-lg bg-gray-900 text-white py-3 font-medium hover:bg-gray-700 transition-colors"
            >
              Ir a mi panel
            </Link>
          </Show>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-gray-400 border-t border-gray-100">
        © {new Date().getFullYear()} {productName}. Todos los derechos reservados.
      </footer>
    </div>
  );
}
