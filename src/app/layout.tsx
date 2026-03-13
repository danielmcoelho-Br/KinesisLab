import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "KinesisLab - Gerenciamento de Avaliações",
  description: "Plataforma avançada para fisioterapia e avaliações biomecânicas.",
  manifest: "/manifest.json",
  themeColor: "#A31621",
};

export const viewport: Viewport = {
  themeColor: "#A31621",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.variable}>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
