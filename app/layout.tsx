import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Carbiforce Chatbot",
  description: "AI-powered cutting tool assistant by Carbiforce",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="h-full bg-[#0f0f0f] text-[#f0f0f0] antialiased">
        {children}
      </body>
    </html>
  );
}
