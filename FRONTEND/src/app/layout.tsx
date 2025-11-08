import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/ExpressAuthContext";
import { Toaster } from "@/components/ui/toaster";
import I18nProvider from "@/components/I18nProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Twiller - Twitter Clone",
  description: "A modern Twitter clone built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
      >
        <I18nProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
