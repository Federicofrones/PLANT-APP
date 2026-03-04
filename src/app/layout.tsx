import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GreenhouseBackground from "@/components/layout/GreenhouseBackground";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GreenGlass | Guardian de la Vida",
  description: "Administra tus plantas con elegancia y precisión en tu invernadero digital.",
  manifest: "/manifest.json",
  themeColor: "#10b981",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GreenGlass",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.className} custom-scrollbar bg-[#0a0c0a]`}>
        <GreenhouseBackground />
        <main className="relative z-0 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
