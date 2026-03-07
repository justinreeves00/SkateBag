import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { PWASetup } from "@/components/PWASetup";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#ff5722",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://skatebag.app"),
  title: "SkateBag — Visualize your trick arsenal",
  description: "The definitive skateboarding trick database and tracker. Log your tricks, test your consistency, and climb the ranks.",
  manifest: "/manifest.json",
  icons: {
    apple: "/app-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SkateBag",
  },
  openGraph: {
    title: "SkateBag",
    description: "Visualize your skateboarding trick arsenal.",
    url: "https://skatebag.app",
    siteName: "SkateBag",
    images: [
      {
        url: "/app-icon.png",
        width: 512,
        height: 512,
      },
    ],
    locale: "en_US",
    type: "website",
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
