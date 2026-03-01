import type { Metadata } from "next";
import { Archivo_Black, Archivo } from "next/font/google";
import "./globals.css";

const archivoBlack = Archivo_Black({
  weight: "400",
  variable: "--font-archivo-black",
  subsets: ["latin"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Skatebag — What's in your bag?",
  description: "The definitive skateboarding trick database and tracker.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${archivoBlack.variable} ${archivo.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
