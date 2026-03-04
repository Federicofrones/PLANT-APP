import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GreenhouseBackground from "@/components/layout/GreenhouseBackground";
import FallingLeaves from "@/components/ui/FallingLeaves";

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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Restore scroll position on PWA return
              if (typeof window !== 'undefined') {
                window.addEventListener('load', () => {
                  const scrollPos = sessionStorage.getItem('scrollPos');
                  if (scrollPos) window.scrollTo(0, parseInt(scrollPos));
                });
                window.addEventListener('scroll', () => {
                  sessionStorage.setItem('scrollPos', window.scrollY.toString());
                });
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.className} custom-scrollbar bg-[#0a0c0a] antialiased`}>
        <GreenhouseBackground />
        <FallingLeaves />
        <main className="relative z-0 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
