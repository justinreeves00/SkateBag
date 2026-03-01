import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { PWASetup } from "@/components/PWASetup";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SkateBag — What's in your bag?",
  description: "The definitive skateboarding trick database and tracker.",
  manifest: "/manifest.json",
  themeColor: "#020617",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SkateBag",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} antialiased`}>
        <PWASetup />
        {children}
      </body>
    </html>
  );
}
