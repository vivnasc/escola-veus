import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import { NavBar } from "@/components/escola/NavBar";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Escola dos Véus",
    template: "%s | Escola dos Véus",
  },
  description: "Vê o que estava invisível. Cursos de autoconhecimento pela Vivianne dos Santos.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/escola_veus-favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Escola dos Véus",
  },
  openGraph: {
    title: "Escola dos Véus",
    description: "Vê o que estava invisível. Cursos de autoconhecimento pela Vivianne dos Santos.",
    siteName: "Escola dos Véus",
    locale: "pt_PT",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0D0D1A",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans bg-escola-bg text-escola-creme antialiased">
        <AuthProvider>
          <main className="pb-nav min-h-dvh">
            {children}
          </main>
          <NavBar />
        </AuthProvider>
      </body>
    </html>
  );
}
