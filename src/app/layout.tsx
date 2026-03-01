import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Skatebag — Track Your Tricks",
  description: "Every skateboarding trick ever documented. Track your progress.",
  keywords: ["skateboarding", "tricks", "skate", "progress tracker"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
