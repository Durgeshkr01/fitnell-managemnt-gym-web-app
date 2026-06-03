import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import ActionProvider from "@/components/action-provider";
import OneTimeActivationNotice from "@/components/one-time-activation-notice";
import "./globals.css";

const displayFont = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SG FITNESS EVOLUTION",
  description: "Gym management system for admins and trainers.",
  manifest: "/manifest.webmanifest",
  themeColor: "#0b1220",
  icons: {
    icon: [
      {
        url: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: "/icons/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-transparent text-slate-100">
        <ActionProvider>
          <OneTimeActivationNotice />
          {children}
        </ActionProvider>
      </body>
    </html>
  );
}
