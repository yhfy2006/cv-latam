import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { PosthogProvider } from "@/components/PosthogProvider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_SITE_NAME ?? "CurriculumIA",
  description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION ?? "Crea tu CV profesional con inteligencia artificial en segundos.",
  openGraph: {
    title: process.env.NEXT_PUBLIC_SITE_NAME ?? "CurriculumIA",
    description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION ?? "Crea tu CV profesional con inteligencia artificial en segundos.",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com",
    siteName: process.env.NEXT_PUBLIC_SITE_NAME ?? "CurriculumIA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: process.env.NEXT_PUBLIC_SITE_NAME ?? "CurriculumIA",
    description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION ?? "Crea tu CV profesional con inteligencia artificial en segundos.",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="es">
        <body className={geist.className}>
          <PosthogProvider>
            {children}
            <Toaster />
          </PosthogProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
