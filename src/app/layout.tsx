import "@/styles/globals.css";

import { type Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";

import { TRPCReactProvider } from "@/trpc/react";
import { AbilityProvider } from "@/providers/ability-context";
import {
  ConsentManagerDialog,
  ConsentManagerProvider,
  CookieBanner,
} from "@c15t/nextjs";
import { Analytics } from "@vercel/analytics/next";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export const metadata: Metadata = {
  title: "Humantryx | AI Powered Human Resource Management System",
  description:
    "A comprehensive HRMS solution leveraging AI for enhanced efficiency.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakartaSans.variable}`}>
      <body className="font-sans antialiased">
        <NuqsAdapter>
          <TRPCReactProvider>
            <AbilityProvider>
              <ConsentManagerProvider
                options={{
                  mode: "c15t",
                  backendURL: "/api/c15t",
                }}
              >
                {children}
                <Analytics />
                <ConsentManagerDialog />
                <CookieBanner />
              </ConsentManagerProvider>
            </AbilityProvider>
            <Toaster position="top-right" />
          </TRPCReactProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
