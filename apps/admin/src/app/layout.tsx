import type { Metadata } from "next";
import { Poppins, Unbounded, Noto_Nastaliq_Urdu } from "next/font/google";
import "./globals.css";

const fontSans = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

const fontHeading = Unbounded({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
});

const fontUrdu = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-urdu",
});

import { AdminShell } from "@/components/shell/AdminShell";
import { AdminAuthProvider } from "@/hooks/use-admin-auth";
import { RegisterServiceWorker } from "@/components/shell/RegisterServiceWorker";

export const metadata: Metadata = {
  title: "Raza Stationers Admin",
  icons: { icon: "/brand-mark.svg", apple: "/brand-mark.svg" },
  manifest: "/manifest.webmanifest",
  description: "Operations dashboard for Raza Stationers staff.",
  robots: "noindex, nofollow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontHeading.variable} ${fontUrdu.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[var(--color-canvas)] text-[var(--color-ink-900)]">
        <RegisterServiceWorker />
        <AdminAuthProvider><AdminShell>{children}</AdminShell></AdminAuthProvider>
      </body>
    </html>
  );
}
